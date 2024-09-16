// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails
import "@hotwired/turbo-rails"
import "controllers"



function displayFileName() {
    const fileInput = document.getElementById('fileInput');
    const fileInfo = document.getElementById('fileInfo');
    const file = fileInput.files[0];

    if (file) {
      fileInfo.textContent = `Izvēlētais fails: ${file.name}`;
      fileInfo.style.display = 'block';
    } else {
      fileInfo.style.display = 'none';
    }
  }

  function postComment() {
    const inputField = document.getElementById('inputField');
    const fileInput = document.getElementById('fileInput');
    const text = inputField.value.trim();
    const file = fileInput.files[0];

    if (text || file) {
      const newPost = document.createElement('div');
      newPost.className = 'post';

      if (text) {
        const textElement = document.createElement('p');
        textElement.textContent = text;
        newPost.appendChild(textElement);
      }

      if (file) {
        const fileReader = new FileReader();
        fileReader.onload = function(event) {
          if (file.type.startsWith('image/')) {
            const imgElement = document.createElement('img');
            imgElement.src = event.target.result;
            newPost.appendChild(imgElement);
          } else {
            const fileElement = document.createElement('p');
            fileElement.textContent = `Uploaded file: ${file.name}`;
            newPost.appendChild(fileElement);
          }
        };
        fileReader.readAsDataURL(file);
      }

      const postContainer = document.getElementById('post-container');
      postContainer.appendChild(newPost);

      inputField.value = '';
      fileInput.value = '';
      document.getElementById('fileInfo').style.display = 'none'; 
    }
  }