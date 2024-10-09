const modelViewer = document.querySelector("#sarahs-haus");

//function to move the camera to the target position and orbit
const annotationClicked = (annotation) => {
  let dataset = annotation.dataset;
  modelViewer.cameraTarget = dataset.target;
  modelViewer.cameraOrbit = dataset.orbit;
  modelViewer.fieldOfView = '45deg';
}

//function to open the overlay
const openOverlay = (overlay) => {
    let dataset = overlay.dataset;
    overlay.style.display = 'block';
}

//function to close the overlay
const closeOverlay = (overlay) => {
    overlay.style.display = 'none';
}

//function to show the buttons
modelViewer.querySelectorAll('.view-button').forEach((hotspot) => {
  hotspot.addEventListener('click', () => annotationClicked(hotspot));
});

//Information Buttons open the overlay
modelViewer.querySelectorAll('.overlay-button').forEach((hotspot) => {
  hotspot.addEventListener('click', () => openOverlay(hotspot));
});

//Room Sidebar moves camera to the corresponding room and shows the corresponding info buttons
document.addEventListener('DOMContentLoaded', function() {
    const modelViewer = document.querySelector("#sarahs-haus");
    const sidebar = document.querySelector("#room-sidebar");
    const viewButtons = modelViewer.querySelectorAll('.view-button');
    const infoButtons = modelViewer.querySelectorAll('.info-button');

    let currentRoom = null;
    let currentTarget = null;

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

