//On load
document.addEventListener('DOMContentLoaded', function() {

    ////////////////////////////////////////////////////////////////// Initialization

    //Model Viewer
    const modelViewer = document.querySelector("#sarahs-haus");

    //Room Sidebar
    const sidebar = document.querySelector("#room-sidebar");

    //Buttons
    const viewButtons = modelViewer.querySelectorAll('.view-button');
    const infoButtons = modelViewer.querySelectorAll('.info-button');
    const room0Button = document.getElementById('room-0-button');
    const switchRoomButtons = document.querySelectorAll('.switch-room-button');

    //Info Window
    const infoWindow = document.getElementById('info-window');
    const infoWindowTitle = document.getElementById('info-window-title');
    const infoWindowContent = document.getElementById('info-window-content');
    const closeInfoWindowButton = document.getElementById('close-info-window'); 
    const orbitthreshold= 15; 
    
    //Variables
    let currentRoom = 0;
    let currentTarget = null;

    modelViewer.cameraTarget = viewButtons[0].target;
    modelViewer.cameraOrbit = viewButtons[0].orbit;

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
    
        // Handle special cases for about and contact
        if (roomNumber === 'about' || roomNumber === 'contact') {
            console.log('Special case:', roomNumber);
            console.log('Available info:', roomInformation[roomNumber]);
            if (roomInformation[roomNumber] && roomInformation[roomNumber][infoNumber]) {
                return roomInformation[roomNumber][infoNumber];
            }
        }
    
        // Existing room information handling
        console.log('Available rooms:', Object.keys(roomInformation));
        if (roomInformation[roomNumber]) {
            console.log('Available info for room', roomNumber + ':', Object.keys(roomInformation[roomNumber]));
        }
    
        if (!roomInformation[roomNumber] || !roomInformation[roomNumber][infoNumber]) {
            console.warn('No info content for room:', roomNumber, 'info:', infoNumber);
            return { 
                title: 'Information Not Available', 
                content: `<p>Sorry, no information is currently available.</p>`
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

    function updateRoom0ButtonVisibility() {
        const orbit = modelViewer.getCameraOrbit();
        const distance = orbit.radius;
        
        if (distance < orbitthreshold) {
            room0Button.classList.remove('hidden');
        } else {
            room0Button.classList.add('hidden');
        }
    }

    function updateSwitchRoomButtonsVisibility() {
        const switchButtons = document.querySelectorAll('.switch-room-button');
    
        // Show switch buttons only when a room's information is being displayed and room number is not 0
        if (currentRoom !== null && currentRoom !== "0") {
            switchButtons.forEach(button => button.classList.remove('hidden'));
        } else {
            switchButtons.forEach(button => button.classList.add('hidden'));
        }
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
        updateSwitchRoomButtonsVisibility();
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
            updateSwitchRoomButtonsVisibility();
        } else if (currentRoom) {
            showRoomInfo(currentRoom);
        }
    }

    //function to check if the camera is in the room when the camera changes
    modelViewer.addEventListener('camera-change', (event) => {
        if (event.detail.source === 'user-interaction') {
            checkCameraPosition();
        }
        updateRoom0ButtonVisibility();
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
    document.querySelectorAll('.room-button').forEach((button) => {
        button.addEventListener('click', () => {
            const roomNumber = button.dataset.room;
            const correspondingHotspot = modelViewer.querySelector(`[slot="hotspot-${roomNumber}"]`);
            if (correspondingHotspot && roomNumber !== 'NaN') {
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
    updateRoom0ButtonVisibility();

    ////////////////////////////////////////////////////////////////// Mobile View and Overlay

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

    ////////////////////////////////////////////////////////////////// Loading Video

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

    // Add these functions after your other function declarations
    function switchRoom(direction) {
        if (currentRoom === null) return;
        
        // Get all available room buttons to determine valid room numbers
        const validRooms = Array.from(document.querySelectorAll('.room-button'))
            .map(button => parseInt(button.dataset.room))
            .filter(num => !isNaN(num) && num !== 0) // Exclude room 0
            // .sort((a, b) => a - b);
        
        // Find current index and calculate next room
        const currentIndex = validRooms.indexOf(parseInt(currentRoom));
        let nextIndex = currentIndex + parseInt(direction);
        
        // Handle wrapping around
        if (nextIndex >= validRooms.length) nextIndex = 0;
        if (nextIndex < 0) nextIndex = validRooms.length - 1;
        
        // Get the view button for the next room and trigger its click event
        const nextRoomButton = document.querySelector(`.view-button[data-room="${validRooms[nextIndex]}"]`);
        if (nextRoomButton) {
            nextRoomButton.click(); // This will trigger annotationClicked and adjust camera
            showRoomInfo(validRooms[nextIndex].toString());
        }
    }

    // Add event listeners for the switch room buttons
    switchRoomButtons.forEach(button => {
        button.addEventListener('click', () => switchRoom(button.dataset.direction));
    });

    // Add event listeners for About and Contact buttons
    const aboutButton = document.getElementById('navigation-button-about');
    const contactButton = document.getElementById('navigation-button-contact');

    aboutButton.addEventListener('click', () => {
        const infoContent = getInfoContent('about', '1');
        showInfoWindow(infoContent.title, infoContent.content);
    });

    contactButton.addEventListener('click', () => {
        const infoContent = getInfoContent('contact', '1');
        showInfoWindow(infoContent.title, infoContent.content);
    });

});