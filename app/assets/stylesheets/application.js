function displayFileName() {
  const fileInput = document.getElementById('fileInput');
  const previewContainer = document.getElementById('filePreview');
  const file = fileInput.files[0];

  previewContainer.innerHTML = ''; 

  if (file) {
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'X';
    removeBtn.classList.add('remove-file-btn');
    removeBtn.onclick = function() {
      fileInput.value = ''; 
      previewContainer.innerHTML = ''; 
    };

    if (file.type.match('image.*')) {
      const imgPreview = document.createElement('img');
      imgPreview.src = URL.createObjectURL(file);
      imgPreview.alt = 'Preview image';
      imgPreview.classList.add('preview-img');
      previewContainer.appendChild(imgPreview);
    } else if (file.type.match('video.*')) {
      const videoPreview = document.createElement('video');
      videoPreview.src = URL.createObjectURL(file);
      videoPreview.controls = true;
      videoPreview.classList.add('preview-video');
      previewContainer.appendChild(videoPreview);
    }

    previewContainer.appendChild(removeBtn); 
  }
}


function displayReplyFileName() {
  const fileInput = document.getElementById('replyFileInput');
  const previewContainer = document.getElementById('replyFilePreview');
  const file = fileInput.files[0];

  previewContainer.innerHTML = ''; 

  if (file) {
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'X';
    removeBtn.classList.add('remove-file-btn');
    removeBtn.onclick = function() {
      fileInput.value = ''; 
      previewContainer.innerHTML = ''; 
    };

    if (file.type.match('image.*')) {
      const imgPreview = document.createElement('img');
      imgPreview.src = URL.createObjectURL(file);
      imgPreview.alt = 'Preview image';
      imgPreview.classList.add('preview-img');
      previewContainer.appendChild(imgPreview);
    } else if (file.type.match('video.*')) {
      const videoPreview = document.createElement('video');
      videoPreview.src = URL.createObjectURL(file);
      videoPreview.controls = true;
      videoPreview.classList.add('preview-video');
      previewContainer.appendChild(videoPreview);
    }

    previewContainer.appendChild(removeBtn); 
  }
}




/* Ziņu izveide */

function createPostElement(message) {
  const postElement = document.createElement('div');
  postElement.className = 'post';
  postElement.id = `post-${message.id}`;
  postElement.onclick = function() {
    window.location.href = `/messages/${message.id}`;
  };

  
  //PIEVIENOTAIS
  const userInfoElement = document.createElement('div');
  userInfoElement.className = 'user-info';

 
  if (message.user) {
    const profileImage = document.createElement('img');
    profileImage.src = message.user.profile_picture_url || ''; 
    profileImage.alt = `${message.user.username}'s profile picture`;
    profileImage.className = 'profile-pic'; 

    const usernameElement = document.createElement('span');
    usernameElement.textContent = message.user.username || 'Nezināms lietotājs'; 

    userInfoElement.appendChild(profileImage);
    userInfoElement.appendChild(usernameElement);
  } else {
    console.warn('Nav lietotāja informācija atrasta priekš ziņas:', message);
  }

  postElement.appendChild(userInfoElement);

  // PIEVIENOTAIS 
  

  const textElement = document.createElement('p');
  textElement.textContent = message.content || 'Nav datu';
  postElement.appendChild(textElement);

  if (message.file_url) {
    if (message.file_url.match(/\.(jpg|jpeg|png|gif)$/i)) {
      const img = document.createElement('img');
      img.src = message.file_url;
      img.alt = 'Attached image';
      postElement.appendChild(img);

    } else if (message.file_url.match(/\.(mp4|webm|ogg)$/i)) {
      const video = document.createElement('video');
      video.src = message.file_url;
      video.controls = true; 
      video.style.width = '100%'; 
      postElement.appendChild(video);

    } else {
      const fileLink = document.createElement('a');
      fileLink.href = message.file_url;
      fileLink.textContent = 'Nolādēt failu';
      postElement.appendChild(fileLink);
    }
  }

  return postElement;
}




/* komentu izveide */
function createReplyElement(reply) {
  const replyElement = document.createElement('li');

  const textElement = document.createElement('p');
  textElement.textContent = reply.content;
  replyElement.appendChild(textElement);

  if (reply.file_url) {
    if (reply.file_url.match(/\.(jpg|jpeg|png|gif)$/i)) {
      const img = document.createElement('img');
      img.src = reply.file_url;
      img.alt = 'Attached image';
      replyElement.appendChild(img);

    } else if (reply.file_url.match(/\.(mp4|webm|ogg)$/i)) {
      const video = document.createElement('video');
      video.src = reply.file_url;
      video.controls = true;
      video.style.width = '100%';
      replyElement.appendChild(video);

    } else {
      const fileLink = document.createElement('a');
      fileLink.href = reply.file_url;
      fileLink.textContent = 'Nolādēt failu';
      replyElement.appendChild(fileLink);
    }
  }

  return replyElement;
}





/*Error meklēšana */
function fetchMessages() {
  fetch('/messages', {
    method: 'GET',
    headers: {
      'Accept': 'application/json', 
    }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Interneta responsivitāte nav laba');
      }
      return response.json();
    })
    .then(data => {
      const postContainer = document.getElementById('post-container');
      postContainer.innerHTML = '';

      data.forEach(message => {
        const postElement = createPostElement(message);
        postContainer.appendChild(postElement);
      });
    })
    .catch(error => console.log('Kļūda iegūstot ziņas:', error));
}



function fetchReplies() {
  fetch(`/messages/${messageId}/replies`)
    .then(response => response.json())
    .then(data => {
      const replyContainer = document.getElementById('reply-container');
      replyContainer.innerHTML = '';

      data.forEach(reply => {
        const replyElement = createReplyElement(reply);
        replyContainer.appendChild(replyElement);
      });
    })
    .catch(error => console.error('Error fetching replies:', error));
}

document.addEventListener('DOMContentLoaded', function() {
  fetchMessages();
});






/* Ziņu publicēšana */

function postComment() {
  const inputField = document.getElementById('inputField');
  const text = inputField.value.trim();
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];
  const previewContainer = document.getElementById('filePreview');

  if (!text && !file) {
    alert('Lūdzu, ievadiet ziņu vai pievienojiet failu, lai publicētu.'); // Alert message
    return;
  }

  const formData = new FormData();
  if (text) {
    formData.append('message[content]', text);
  }
  if (file) {
    formData.append('message[file]', file);
  }

  fetch('/messages', {
    method: 'POST',
    headers: {
      'X-CSRF-Token': document.querySelector('[name=csrf-token]').content
    },
    body: formData
  })
    .then(response => response.json())
    .then(data => {
      const newPost = createPostElement(data);
      const postContainer = document.getElementById('post-container');
      postContainer.insertBefore(newPost, postContainer.firstChild);

      inputField.value = '';
      fileInput.value = '';
      document.getElementById('fileInfo').style.display = 'none';

      previewContainer.innerHTML = '';
    })
    .catch(error => console.error('Kļūda publicējot komentu:', error));
}


function postReply() {
  const replyInputField = document.getElementById('replyInputField');
  const replyText = replyInputField.value.trim();
  const replyFileInput = document.getElementById('replyFileInput');
  const file = replyFileInput.files[0];
  const replyPreviewContainer = document.getElementById('replyFilePreview');

  if (!replyText && !file) {
    alert('Lūdzu, ievadiet ziņu vai pievienojiet failu, lai atbildētu.');
    return;
  }

  const formData = new FormData();
  if (replyText) {
    formData.append('reply[content]', replyText);
  }
  if (file) {
    formData.append('reply[file]', file);
  }

  fetch('/messages/${messageId}/replies', {
    method: 'POST',
    headers: {
      'X-CSRF-Token': document.querySelector('[name=csrf-token]').content
    },
    body: formData
  })
    .then(response => response.json())
    .then(data => {
      const newReply = createReplyElement(data);
      const replyContainer = document.getElementById('reply-container');
      replyContainer.appendChild(newReply);

      replyInputField.value = '';
      replyFileInput.value = '';
      replyPreviewContainer.innerHTML = ''; 
    })
    .catch(error => console.error('Error posting reply:', error));
}


/* Taustiņu aktivizācija */

document.getElementById('inputField').addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    postComment();
  }
});




/* profila bildes pirmskats */
document.addEventListener('DOMContentLoaded', function () {
  let cropper;
  const imageInput = document.getElementById('profile_picture_input');
  const previewImage = document.getElementById('preview-image');
  const previewContainer = document.getElementById('preview-container');
  const form = document.querySelector('form'); 

  if (imageInput && previewImage && previewContainer && form) {
    imageInput.addEventListener('change', function(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          previewImage.src = e.target.result; 
          previewImage.style.display = 'block';

          if (cropper) {
            cropper.destroy();
          }

          cropper = new Cropper(previewImage, {
            aspectRatio: 1, 
            viewMode: 1,
            autoCropArea: 1,
            minCropBoxWidth: 100,
            minCropBoxHeight: 100,
            cropBoxResizable: true,
            movable: true,
            rotatable: false,
            scalable: true
          });
        };
        reader.readAsDataURL(file); 
      }
    });

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const canvas = document.getElementById('canvas');

      if (cropper) {
        const croppedImageDataURL = cropper.getCroppedCanvas({
          width: 200, 
          height: 200,
        }).toDataURL(); 

        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = 'user[profile_picture]';
        hiddenInput.value = croppedImageDataURL; 

        this.appendChild(hiddenInput);
        this.submit();
      }
    });
  }
});

