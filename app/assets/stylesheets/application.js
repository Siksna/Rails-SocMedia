/* failu pirmskats */
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







/* Like pogas */
function toggleLike(messageId, button) {
  fetch(`/messages/${messageId}/toggle_like`, {
    method: 'POST',
    headers: {
      'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
      'Accept': 'application/json',
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    const likeCountSpan = button.nextElementSibling; 
    if (data.liked) {
      button.innerHTML = '<i class="fa-solid fa-heart"></i>'; 
    } else {
      button.innerHTML = '<i class="fa-regular fa-heart"></i>'; 
    }
    likeCountSpan.innerText = data.likes_count;
  })
  .catch(error => console.error('Error:', error));
}




function toggleReplyLike(replyId, button) {
  fetch(`/messages/${replyId}/toggle_like`, {
    method: 'POST',
    headers: {
      'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
      'Accept': 'application/json',
    },
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    const likeCountSpan = document.getElementById(`like-reply-count-${replyId}`);
    if (data.liked) {
      button.innerHTML = '<i class="fa-solid fa-heart"></i>'; 
    } else {
      button.innerHTML = '<i class="fa-regular fa-heart"></i>'; 
    }
    likeCountSpan.innerText = data.likes_count;
  })
  .catch(error => console.error('Error:', error));
}





/*Error meklēšana */




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
  const fileInput = document.getElementById('fileInput');
  const messageContent = inputField.value;
  const file = fileInput.files[0];

  if (messageContent.trim() === "") {
    alert("Lūdzu ievadiet ziņu.");
    return;
  }

  const formData = new FormData();
  formData.append('message[content]', messageContent);
  
  if (file) {
    formData.append('message[file]', file);
  }

  fetch('/messages', {
    method: 'POST',
    body: formData,
    headers: {
      'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
    }
  })
  .then(response => {
    if (response.ok) {
      
      location.reload();
    } else {
      window.location.href = '/users/sign_in';
      alert("Neizdevās ievietot ziņu.");
    }
  })
  .catch(error => {
    console.error('Kļūda:', error);
  });
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
  const form = document.querySelector('form');

  if (previewImage.src && !previewImage.src.includes('default_profile.png')) {
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
  }

  imageInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        const newImageSrc = e.target.result + '?' + new Date().getTime();

        previewImage.src = newImageSrc; 
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
    if (cropper) {
      const croppedImageDataURL = cropper.getCroppedCanvas({
        width: 200,
        height: 200
      }).toDataURL(); 

      const hiddenInput = document.createElement('input');
      hiddenInput.type = 'hidden';
      hiddenInput.name = 'user[profile_picture]';
      hiddenInput.value = croppedImageDataURL;

      form.appendChild(hiddenInput);
    }

    form.submit(); 
  });
});



