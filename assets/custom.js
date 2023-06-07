var upload = document.getElementById('files');
upload.onchange = (evt) => {
  const files = [...evt.target.files];
  const preview = document.getElementById('preview');
  if (files) {
    for (const [pos, file] of files.entries()) {
      const col = document.createElement('div');
      col.classList.add('col');

      const pagePosSelect = document.createElement('select');
      pagePosSelect.name = `${file.name}`;
      pagePosSelect.classList.add('page');
      for (let i = 0; i < files.length; i++) {
        var option = document.createElement('option');
        option.value = i + 1;
        option.text = i + 1;
        if (pos + 1 == option.value) {
          option.setAttribute('selected', 'true');
        }
        pagePosSelect.appendChild(option);
      }

      pagePosSelect.classList.add('form-select');
      col.appendChild(pagePosSelect);

      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(img.src); // free memory
      };
      img.classList.add('img-fluid');
      img.classList.add('img-thumbnail');
      col.appendChild(img);

      preview.appendChild(col);
    }
  } else {
    preview.replaceChildren();
  }
};

var uploadForm = document.getElementById('uploadForm');
uploadForm.onreset = () => {
  const preview = document.getElementById('preview');
  preview?.replaceChildren();

  const alertBox = document.getElementById('alert');
  alertBox.classList.add('d-none');
};

uploadForm.onsubmit = (event) => {
  const alertBox = document.getElementById('alert');
  const pageControls = [...document.getElementsByClassName('page')];
  const uniquePageNums = new Set();
  pageControls.forEach((control) => {
    uniquePageNums.add(control.value);
  });

  if (uniquePageNums.size != pageControls.length) {
    if (alertBox) {
      alertBox.classList.remove('d-none');
    }
    event.preventDefault();
  } else {
    if (alertBox) {
      alertBox.classList.add('d-none');
    }
  }
};
