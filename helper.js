

//Room Sidebar moves camera to the corresponding room and shows the corresponding info buttons
document.addEventListener('DOMContentLoaded', function() {
    const modelViewer = document.querySelector("#sarahs-haus");
    const sidebar = document.querySelector("#room-sidebar");
    const viewButtons = modelViewer.querySelectorAll('.view-button');
    const infoButtons = modelViewer.querySelectorAll('.info-button');
    const infoWindow = document.getElementById('info-window');
    const infoWindowTitle = document.getElementById('info-window-title');
    const infoWindowContent = document.getElementById('info-window-content');
    const closeInfoWindowButton = document.getElementById('close-info-window');

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

    //Information Buttons open the overlay
    modelViewer.querySelectorAll('.overlay-button').forEach((hotspot) => {
    hotspot.addEventListener('click', () => openOverlay(hotspot));
    });

    function showInfoWindow(title, content) {
        infoWindowTitle.textContent = title;
        infoWindowContent.innerHTML = content;
        infoWindow.classList.add('visible');
    }

    function hideInfoWindow() {
        infoWindow.classList.remove('visible');
    }

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

    function showButtons() {
        viewButtons.forEach(button => button.classList.add('visible'));
        infoButtons.forEach(button => button.classList.remove('visible'));
    }

    function hideButtons() {
        viewButtons.forEach(button => button.classList.remove('visible'));
        infoButtons.forEach(button => button.classList.remove('visible'));
    }

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

    function distanceBetween(pos1, pos2) {
        return Math.sqrt(
            Math.pow(pos1.x - pos2.x, 2) +
            Math.pow(pos1.y - pos2.y, 2) +
            Math.pow(pos1.z - pos2.z, 2)
        );
    }

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

    modelViewer.addEventListener('camera-change', (event) => {
        if (event.detail.source === 'user-interaction') {
            checkCameraPosition();
        }
    });

    viewButtons.forEach(button => {
        button.addEventListener('click', () => {
            showRoomInfo(button.dataset.room);
        });
    });

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

    closeInfoWindowButton.addEventListener('click', hideInfoWindow);

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
});