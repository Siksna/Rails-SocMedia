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
  
  document.addEventListener("DOMContentLoaded", function () {
    const inputField = document.getElementById("inputField");
  
    if (!inputField) {
      return;
    }
  
    inputField.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        postComment();
      }
    });
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
  
  /* chats */
  document.addEventListener('DOMContentLoaded', function() {
    const postButton = document.getElementById('postChat');
    
    if (postButton) {
      postButton.addEventListener('click', postChat);
    }
  });

  function postChat() {

    const chatId = document.querySelector(".chats-box").dataset.chatConversationId;
    const inputField = document.getElementById("inputField_chat");
    const messageContent = inputField.value.trim();
    const fileInput = document.getElementById("fileInput_chat");
    const file = fileInput.files[0];
  
    if (!messageContent) {
      alert("Please enter a message.");
      return;
      
    }else{

    const formData = new FormData();
    formData.append("chat_conversation[content]", messageContent);
  
    if (file) {
      formData.append("chat_conversation[file]", file);
    }
  
    fetch(`/chats/${chatId}/chat_conversations`, {
      method: "POST",
      body: formData,
      headers: {
        "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]').getAttribute("content"),
        "Accept": "text/plain"
      },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.text();
      })
      .then(text => {
        if (text) {
          console.log("Response from server:", text);
          inputField.value = "";
        }
      })
      .catch(error => console.error("Error:", error));
    }
  }
  
  
  
  /* Notifications */
  document.addEventListener("DOMContentLoaded", function () {
  
    const messageNotificationCount = document.getElementById("message-notification-count");
  
    function updateUnreadMessages() {
      fetch("/notifications/unread")
        .then(response => response.json())
        .then(data => {
          console.log("API notis:", data); 
  
          const unreadCount = data.unread_count;
  
          if (unreadCount > 0) {
            messageNotificationCount.textContent = unreadCount;
            messageNotificationCount.style.display = "inline-block";
          } else {
            messageNotificationCount.style.display = "none";
          }
  
          localStorage.setItem("unreadChatCount", unreadCount);
        })
        .catch(error => console.error("Error fetching notifications:", error));
    }
  
    updateUnreadMessages();
  });

    function markChatAsRead(conversationId) {
      console.log("Marking chat as read for conversation ID:", conversationId);
    
      fetch(`/notifications/mark_as_read/${conversationId}`, {
        method: "POST",
        headers: {
          "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]').content,
          "Content-Type": "application/json"
        }
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          console.log("All notifications for conversation marked as read.");
          const messageNotificationCount = document.getElementById("message-notification-count");
          if (messageNotificationCount) {
            messageNotificationCount.textContent = "0";
            messageNotificationCount.style.display = "none";
          }
          localStorage.setItem("unreadChatCount", "0");
        } else {
          console.error("Error marking messages as read:", data.error);
        }
      })
      .catch(error => console.error("Error marking messages as read:", error));
    }    


if (window.location.pathname.includes("/chats/")) {
    const conversationId = window.location.pathname.split("/").pop();
    markChatAsRead(conversationId);
}

  