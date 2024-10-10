//On load
document.addEventListener('DOMContentLoaded', function() {

    //Model Viewer
    const modelViewer = document.querySelector("#sarahs-haus");

    //Room Sidebar
    const sidebar = document.querySelector("#room-sidebar");

    //Buttons
    const viewButtons = modelViewer.querySelectorAll('.view-button');
    const infoButtons = modelViewer.querySelectorAll('.info-button');

    //Info Window
    const infoWindow = document.getElementById('info-window');
    const infoWindowTitle = document.getElementById('info-window-title');
    const infoWindowContent = document.getElementById('info-window-content');
    const closeInfoWindowButton = document.getElementById('close-info-window');

    //Variables
    let currentRoom = null;
    let currentTarget = null;

    // If you need to ensure 'informations.js' is loaded before using roomInformation, you might want to check its existence:
    if (typeof roomInformation === 'undefined') {
        console.error('roomInformation is not defined. Make sure informations.js is loaded properly.');
    }

    //function to move the camera to the target position and orbit
    const annotationClicked = (annotation) => {
        let dataset = annotation.dataset;
        modelViewer.cameraTarget = dataset.target;
        modelViewer.cameraOrbit = dataset.orbit;
        modelViewer.fieldOfView = '45deg';
    }

    //function to show the buttons
    modelViewer.querySelectorAll('.view-button').forEach((hotspot) => {
        hotspot.addEventListener('click', () => annotationClicked(hotspot));
    });

    //function to show the info overlay with iframes inside
    function showInfoWindow(title, content) {
        infoWindowTitle.textContent = title;
        infoWindowContent.innerHTML = content;
        infoWindow.classList.add('visible');
    }

    //function to hide the info overlay 
    function hideInfoWindow() {
        infoWindow.classList.remove('visible');
    }
  
    //get the right information for the info overlay from Informations.js and debug it
    function getInfoContent(roomNumber, infoNumber) {
        console.log('Getting info for room:', roomNumber, 'info:', infoNumber);

        console.log('Available rooms:', Object.keys(roomInformation));
        if (roomInformation[roomNumber]) {
            console.log('Available info for room', roomNumber + ':', Object.keys(roomInformation[roomNumber]));
        }

        if (!roomInformation[roomNumber] || !roomInformation[roomNumber][infoNumber]) {
            console.warn('No info content for room:', roomNumber, 'info:', infoNumber);
            return { 
                title: 'Information Not Available', 
                content: `<p>Sorry, no information is currently available for Room ${roomNumber}, Info ${infoNumber}.</p>`
            };
        }

        return roomInformation[roomNumber][infoNumber];
    }

    //function to show the buttons
    function showButtons() {
        viewButtons.forEach(button => button.classList.add('visible'));
        infoButtons.forEach(button => button.classList.remove('visible'));
    }

    //function to hide the buttons
    function hideButtons() {
        viewButtons.forEach(button => button.classList.remove('visible'));
        infoButtons.forEach(button => button.classList.remove('visible'));
    }

    //function to show the info buttons for the corresponding room
    function showRoomInfo(roomNumber) {
        hideButtons();
        infoButtons.forEach(button => {
            if (button.dataset.room === roomNumber) {
                button.classList.add('visible');
            }
        });
        currentRoom = roomNumber;
        currentTarget = modelViewer.getCameraTarget();
    }

    //function to calculate the distance between two positions (for the camera position check)
    function distanceBetween(pos1, pos2) {
        return Math.sqrt(
            Math.pow(pos1.x - pos2.x, 2) +
            Math.pow(pos1.y - pos2.y, 2) +
            Math.pow(pos1.z - pos2.z, 2)
        );
    }

    //function to check if the camera is in the room
    function checkCameraPosition() {
        const currentCameraTarget = modelViewer.getCameraTarget();
        const orbit = modelViewer.getCameraOrbit();
        const distance = orbit.radius;

        if (distance > 7.5 || (currentTarget && distanceBetween(currentCameraTarget, currentTarget) > 1.5)) {
            showButtons();
            currentRoom = null;
            currentTarget = null;
        } else if (currentRoom) {
            showRoomInfo(currentRoom);
        }
    }

    //function to check if the camera is in the room when the camera changes
    modelViewer.addEventListener('camera-change', (event) => {
        if (event.detail.source === 'user-interaction') {
            checkCameraPosition();
        }
    });

    //function to show the info buttons for the corresponding room when the view buttons are clicked
    viewButtons.forEach(button => {
        button.addEventListener('click', () => {
            showRoomInfo(button.dataset.room);
        });
    });

    //function to show the info overlay when the info buttons are clicked
    infoButtons.forEach(button => {
      button.addEventListener('click', () => {
          console.log('Info button clicked');
          const roomNumber = button.dataset.room;
          const infoNumber = button.dataset.info || '1'; // Default to '1' if data-info is missing
          console.log('Button data:', button.dataset);
          console.log('Room:', roomNumber, 'Info:', infoNumber);
          const infoContent = getInfoContent(roomNumber, infoNumber);
          showInfoWindow(infoContent.title, infoContent.content);
      });
    });
    
    //function to hide the info overlay when the close button is clicked
    closeInfoWindowButton.addEventListener('click', hideInfoWindow);

    //function to move the camera to the corresponding room when the room buttons are clicked
    sidebar.querySelectorAll('.room-button').forEach((button) => {
        button.addEventListener('click', () => {
            const roomNumber = button.dataset.room;
            const correspondingHotspot = modelViewer.querySelector(`[slot="hotspot-${roomNumber}"]`);
            if (correspondingHotspot) {
                const dataset = correspondingHotspot.dataset;
                modelViewer.cameraTarget = dataset.target;
                modelViewer.cameraOrbit = dataset.orbit;
                modelViewer.fieldOfView = '45deg';
                showRoomInfo(roomNumber);
            }
        });
    });

    // Initially hide all buttons
    hideButtons();

    //function to detect if the browser is on a mobile device
    function isMobile() {
        // Check if we're forcing mobile view for testing
        if (window.forceMobileView) {
            return true;
        }
        
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
            || (window.matchMedia && window.matchMedia("(max-width: 767px)").matches);
    }

    // Function to toggle mobile view for testing
    function toggleMobileView() {
        window.forceMobileView = !window.forceMobileView;
        handleMobileLayout();
    }

    //toggleMobileView(); // for Testing the mobile view

    //function to show the mobile overlay
    function showMobileOverlay() {
        const overlay = document.getElementById('mobile-overlay');
        overlay.classList.add('visible');

        const closeButton = overlay.querySelector('.close-button');
        closeButton.addEventListener('click', () => {
            overlay.classList.remove('visible');
        });
    }

    function handleMobileLayout() {
        const sidebar = document.getElementById('sidebar');
        
        if (isMobile()) {
            // Hide sidebar
            if (sidebar) {
                sidebar.style.display = 'none';
            }
            
            // Show mobile overlay
            showMobileOverlay();
        } else {
            // Show sidebar for non-mobile devices
            if (sidebar) {
                sidebar.style.display = 'block'; // or 'flex', depending on your layout
            }
        }
    }

    // Call this function when the page loads and on window resize
    window.addEventListener('load', handleMobileLayout);
    window.addEventListener('resize', handleMobileLayout);

    // Hide loading screen when the model is loaded
    modelViewer.addEventListener('load', () => {
        const loadingScreen = document.getElementById('loading-screen');
        const loadingVideo = document.getElementById('loading-video');
        loadingScreen.classList.add('hidden');
        loadingVideo.pause();
    });

    // Show loading screen if there's an error loading the model
    modelViewer.addEventListener('error', () => {
        console.error('Error loading model');
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.classList.remove('hidden');
    });
});