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


function fetchMessages() {
  fetch('/messages')
    .then(response => response.json())
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

function createPostElement(message) {
  const postElement = document.createElement('div');
  postElement.className = 'post';
  postElement.id = `post-${message.id}`;
  postElement.onclick = function() {
    window.location.href = `/messages/${message.id}`;
  };

  const textElement = document.createElement('p');
  textElement.textContent = message.content;
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



document.addEventListener('DOMContentLoaded', function() {
  fetchMessages();
});

document.getElementById('inputField').addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    postComment();
  }
});
