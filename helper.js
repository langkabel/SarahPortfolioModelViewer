const modelViewer2 = document.querySelector("#sarahs-haus");
const annotationClicked = (annotation) => {
  let dataset = annotation.dataset;
  modelViewer2.cameraTarget = dataset.target;
  modelViewer2.cameraOrbit = dataset.orbit;
  modelViewer2.fieldOfView = '45deg';
}

const openOverlay = (overlay) => {
    let dataset = overlay.dataset;
    overlay.style.display = 'block';
}

modelViewer2.querySelectorAll('.view-button').forEach((hotspot) => {
  hotspot.addEventListener('click', () => annotationClicked(hotspot));
});

modelViewer2.querySelectorAll('.overlay-button').forEach((hotspot) => {
  hotspot.addEventListener('click', () => openOverlay(hotspot));
});

