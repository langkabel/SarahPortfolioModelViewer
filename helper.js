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

modelViewer.querySelectorAll('.view-button').forEach((hotspot) => {
  hotspot.addEventListener('click', () => annotationClicked(hotspot));
});

modelViewer.querySelectorAll('.overlay-button').forEach((hotspot) => {
  hotspot.addEventListener('click', () => openOverlay(hotspot));
});

document.addEventListener('DOMContentLoaded', function() {

    const sidebar = document.querySelector("#room-sidebar");

    sidebar.querySelectorAll('.room-button').forEach((button) => {
        button.addEventListener('click', () => {
            const roomNumber = button.dataset.room;
            const correspondingHotspot = modelViewer.querySelector(`[slot="hotspot-${roomNumber}"]`);
            if (correspondingHotspot) {
                const dataset = correspondingHotspot.dataset;
                modelViewer.cameraTarget = dataset.target;
                modelViewer.cameraOrbit = dataset.orbit;
                modelViewer.fieldOfView = '45deg';
            }
        });
    });
});

