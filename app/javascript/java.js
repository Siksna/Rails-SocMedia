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
  

  document.addEventListener("DOMContentLoaded", function() {
    const fileInput = document.getElementById('fileInput');
    fileInput.addEventListener('change', displayFileName);
  });
  
  window.displayFileName = displayFileName;

  
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
  
  
  window.displayReplyFileName = displayReplyFileName;

  
  
  
  
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
  
    window.toggleLike = toggleLike;

  
  
  function toggleReplyLike(replyId, button, messageId) {
  fetch(`/messages/${messageId}/replies/${replyId}/toggle_like`, {
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


  
  window.toggleReplyLike = toggleReplyLike;
  
  
  
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
  
  
  
  
  
  
  
  
  // Ziņu publicēšana
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

window.postComment = postComment;

  

let currentParentReplyId = null;

function postReply(event) {
  event.preventDefault();

  const replyInputField = document.getElementById('replyInputField');
  const mentionedUsername = document.getElementById('dynamic-reply-mentioned-username').value.trim();
  let replyText = replyInputField.value.trim();
  const shouldMention = document.getElementById('replying-to-should-mention').value === "1";

    if (mentionedUsername && currentParentReplyId && shouldMention) {
  replyText = `@${mentionedUsername} ${replyText}`;
    }

  const replyFileInput = document.getElementById('replyFileInput');
  const file = replyFileInput.files[0];
  const replyPreviewContainer = document.getElementById('replyFilePreview');
  const parentIdInput = document.getElementById('dynamic-reply-parent-id');
  const submitButton = document.getElementById('replySubmitButton');
  if (!replyText && !file) {
    alert('Lūdzu, ievadiet ziņu vai pievienojiet failu, lai atbildētu.');
    return;
  }

  submitButton.disabled = true;

  const formData = new FormData();
  if (replyText) formData.append('reply[content]', replyText);
  if (file) formData.append('reply[file]', file);
  if (currentParentReplyId) formData.append('reply[parent_id]', currentParentReplyId);

  const messageId = document.getElementById('message-id-hidden').value;

  fetch(`/messages/${messageId}/replies`, {
    method: 'POST',
    headers: {
      'X-CSRF-Token': document.querySelector('[name=csrf-token]').content,
      'Accept': 'text/html'
    },
    body: formData
  })
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.text();
    })
    .then(html => {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html.trim();

      Array.from(tempDiv.children).forEach(child => {
        const isChildReply = !!currentParentReplyId;
        if (isChildReply) {
          const parentReplyElement = document.querySelector(`#reply-${currentParentReplyId}`);
          const childRepliesContainer = parentReplyElement?.querySelector('.child-replies');
          if (childRepliesContainer) {
            childRepliesContainer.appendChild(child);
          }
        } else {
          const replyList = document.querySelector('.reply-list');
          replyList.insertBefore(child, replyList.firstChild);
        }

        bindClickableReplyEvent(child);
      });

      replyInputField.value = '';
      replyFileInput.value = '';
      replyPreviewContainer.innerHTML = '';
      parentIdInput.value = '';
      document.getElementById('replying-to-label').style.display = 'none';

     if (currentParentReplyId) {

        const parentCommentCountSpan = document.getElementById(`comment-count-${currentParentReplyId}`);

        if (parentCommentCountSpan) {
          const match = parentCommentCountSpan.innerText.match(/\d+/);
          const currentCount = match ? parseInt(match[0], 10) : 0;
          const newCount = currentCount + 1;
          parentCommentCountSpan.innerText = `${newCount} comment${newCount !== 1 ? 's' : ''}`;
      }
      }
      else {
       const commentCountSpan = document.getElementById(`comment-count-${messageId}`);
      if (commentCountSpan) {
        const currentCount = parseInt(commentCountSpan.innerText, 10);
        commentCountSpan.innerText = currentCount + 1;
      }
    }

      currentParentReplyId = null;


    })
    .catch(error => {
      console.error('Error posting reply:', error);
      alert('Error, try again.');
    })
    .finally(() => {
      submitButton.disabled = false;
    });
}

window.postReply = postReply;

export function bindClickableReplyEvent(replyElement) {
  if (!replyElement || !replyElement.classList.contains('clickable-reply')) return;

  replyElement.addEventListener("click", function (e) {
    if (e.target.closest("a") || e.target.closest("button") || e.target.closest("i")) return;

    const clickedReply = e.currentTarget;
    currentParentReplyId = clickedReply.dataset.parentId || clickedReply.dataset.messageId;

    const isParentReply = !clickedReply.dataset.parentId; 
    const username = clickedReply.dataset.replyUsername;
    const replyId = clickedReply.dataset.replyId;

    document.getElementById("dynamic-reply-parent-id").value = replyId;

    document.getElementById("dynamic-reply-mentioned-username").value = username;
    

    const inputField = document.getElementById("replyInputField");

     if (isParentReply) {
      document.getElementById("replying-to-should-mention").value = "0";
    } else {
      document.getElementById("replying-to-should-mention").value = "1";
      
    }
    document.getElementById("replying-to-username").textContent = "@" + username;
    document.getElementById("replying-to-label").style.display = "block";
    inputField.focus();

    e.stopPropagation();
  });
}


document.addEventListener("DOMContentLoaded", function () {
  const replyFormWrapper = document.getElementById("dynamic-reply-form-wrapper");
  const parentIdInput = document.getElementById("dynamic-reply-parent-id");
  const replyingToLabel = document.getElementById("replying-to-label");
  const mentionedUsername = document.getElementById("dynamic-reply-mentioned-username");

  replyingToLabel.style.display = "none";

  document.querySelectorAll(".clickable-reply").forEach(bindClickableReplyEvent);

  window.clearReplyTarget = function () {
    parentIdInput.value = "";
    replyingToLabel.style.display = "none";
    currentParentReplyId = null;
    mentionedUsername.value = "";
  };

  document.addEventListener("click", function (e) {
    if (
      !replyFormWrapper.contains(e.target) &&
      !e.target.closest(".clickable-reply")
    ) {
      clearReplyTarget();
    }
  });
});







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
  let atBottomTimer = null;

  document.addEventListener("DOMContentLoaded", function () {
    const postButton = document.getElementById("postChat");
    const chatBox = document.querySelector(".chats-box");
    const newMessageBtn = createNewMessageButton();
    let shouldAutoScroll = true;

    if (postButton) {
      postButton.addEventListener("click", postChat);
    }

    if (chatBox) {
      chatBox.addEventListener("scroll", () => {
        const nearBottom = isNearBottom(chatBox);
        shouldAutoScroll = nearBottom;
        if (nearBottom) newMessageBtn.style.display = "none";
      });
    }

    scrollToBottom();
  });

  function postChat(event) {
    event.preventDefault();
    

    scrollToBottom(); 

    const chatId = document.querySelector(".chats-box").dataset.chatConversationId;
    const inputField = document.getElementById("inputField_chat");
    const messageContent = inputField.value.trim();
    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];
    const previewContainer = document.getElementById('filePreview');

    
  if (!messageContent && !file) {
  inputField.classList.add("input-error");
  inputField.placeholder = "Please enter a message";

  fileInput.classList.add("input-error");

  return;
}


inputField.classList.remove("input-error");
fileInput.classList.remove("input-error");
inputField.placeholder = "Enter your message...";



    inputField.value = "";
    fileInput.value = "";
    previewContainer.innerHTML = "";


    const formData = new FormData();
    formData.append("chat_conversation[content]", messageContent);
    if (file) formData.append("chat_conversation[file]", file);

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
        }
      })
      .catch(error => console.error("Error:", error));
  }


  function updateLastReadAt(chatId) {
    fetch(`/chats/${chatId}/update_last_read_at`, {
      method: "POST",
      headers: {
        "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]').getAttribute("content"),
        "Accept": "application/json"
      }
    })
      .then(response => response.json())
      .then(data => {
      })
      .catch(error => console.error('Error updating last_read_at:', error));
  }
  
  

function isNearBottom(container, threshold = 100) {
  return container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
}

function scrollToBottom() {
  const chatBox = document.querySelector(".chats-box");
  if (chatBox) {
    chatBox.scrollTop = chatBox.scrollHeight;
  }
}

function clearUnseen() {
  document.querySelectorAll(".chat-message.unseen").forEach(msg =>
    msg.classList.remove("unseen")
  );

  const divider = document.querySelector(".unseen-divider");
  if (divider) divider.remove();
}

function ensureUnseenDivider() {
  const chatMessages = document.getElementById("chats_messages");
  const currentUserId = document.body.dataset.currentUserId;

  const firstUnseen = [...document.querySelectorAll(".chat-message.unseen")]
    .find(msg => msg.dataset.senderId !== currentUserId);

  if (firstUnseen && !document.querySelector(".unseen-divider")) {
    const divider = document.createElement("div");
    divider.classList.add("unseen-divider");
    chatMessages.insertBefore(divider, firstUnseen);
  }
}



function createNewMessageButton() {
  const btn = document.createElement("button");
  btn.id = "newMessageBtn";
  btn.innerText = "New message";
  btn.style.cssText = `
    position: absolute;
    bottom: 90px;
    right: 20px;
    padding: 10px 14px;
    border: none;
    background: #0d6efd;
    color: white;
    border-radius: 20px;
    cursor: pointer;
    display: none;
    z-index: 1000;
    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  `;

  btn.addEventListener("click", () => {
    scrollToBottom();
    btn.style.display = "none";
  });

  document.body.appendChild(btn);
  return btn;
}

function handleScroll() {
  const chatBox = document.querySelector(".chats-box");
  const chatId = document.querySelector(".chats-box").dataset.chatConversationId;

  if (!chatBox) return;

  const isAtBottom = isNearBottom(chatBox);

  if (isAtBottom) {
    debouncedMarkChatAsRead(chatId);
    if (atBottomTimer) clearTimeout(atBottomTimer);

    atBottomTimer = setTimeout(() => {
      if (isNearBottom(chatBox)) {
        clearUnseen();
      updateLastReadAt(chatId);
      
      }
    }, 2000);
  } else {
    if (atBottomTimer) clearTimeout(atBottomTimer);
    const unseenMessages = document.querySelectorAll(".chat-message.unseen");
    if (unseenMessages.length > 0) {
      ensureUnseenDivider();
    }
  }
}

function scrollToFirstUnseenOrBottom() {
  const chatBox = document.querySelector(".chats-box");
  const firstUnseen = document.querySelector(".chat-message.unseen");

  if (!chatBox) return;

  if (firstUnseen) {
    const offsetTop = firstUnseen.offsetTop;
    const boxHeight = chatBox.clientHeight;
    chatBox.scrollTop = offsetTop - boxHeight / 2;
    ensureUnseenDivider();
  } else {
    scrollToBottom();
  }
}


document.addEventListener("DOMContentLoaded", () => {
  const chatBox = document.querySelector(".chats-box");

  if (chatBox) {
    chatBox.addEventListener("scroll", handleScroll);

    const scrollBtn = document.getElementById("scrollToLatestBtn");
    if (scrollBtn) {
      scrollBtn.addEventListener("click", () => {
        scrollToBottom();
        clearUnseen();
        scrollBtn.style.display = "none";
      });
    }

    setTimeout(() => {
      scrollToFirstUnseenOrBottom();
    }, 50);
  }
});
 

  

  function debounce(func, delay) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
  }
  
  
  const debouncedMarkChatAsRead = debounce(function(conversationId) {
  
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
          const messageNotificationCount = document.getElementById("message-notification-count");
          if (messageNotificationCount) {
            messageNotificationCount.textContent = "0";
            messageNotificationCount.style.display = "none";
          }
          localStorage.setItem("unreadChatCount", "0");
        } else {
          console.error(" Error marking messages as read:", data.error);
        }
      })
      .catch(error => console.error(" Error marking messages as read:", error));
  }, 1000); 
  
  
  if (window.location.pathname.includes("/chats/")) {
    const conversationId = window.location.pathname.split("/").pop();
    debouncedMarkChatAsRead(conversationId);
  }



function markSingleNotificationAsRead(notificationId, element) {
  fetch(`/notifications/mark_as_read_notification/${notificationId}`, {
    method: "POST",
    headers: {
      "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]').content,
      "Content-Type": "application/json"
    }
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      if (element) element.style.display = "none";

    } else {
      console.error("Failed to mark notification as read:", data.error);
    }
  })
  .catch(error => console.error("Error marking notification as read:", error));
}



 /* Notifications */
  document.addEventListener("DOMContentLoaded", function () {
   const messageNotificationCount = document.getElementById("message-notification-count");
          const generalNotificationCount = document.getElementById("notification-count");
          const notificationDropdown = document.getElementById("notifications-dropdown");
    

function timeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1
  };

  for (const [unit, value] of Object.entries(intervals)) {
    const diff = Math.floor(seconds / value);
    if (diff >= 1) return rtf.format(-diff, unit);
  }

  return "just now";
}

    function updateUnreadMessages() {
      fetch("/notifications/unread")
        .then(response => response.json())
        .then(data => {
    
         
          if (messageNotificationCount) {
            if (data.chat_unread_count > 0) {
              messageNotificationCount.textContent = data.chat_unread_count;
              messageNotificationCount.style.display = "inline-block";
            } else {
              messageNotificationCount.style.display = "none";
            }
          }
    
          if (generalNotificationCount) {
            if (data.general_unread_count > 0) {
              generalNotificationCount.textContent = data.general_unread_count;
              generalNotificationCount.style.display = "inline-block";
            } else {
              generalNotificationCount.style.display = "none";
            }
          }
    
          if (notificationDropdown) {
            notificationDropdown.innerHTML = "";
    
            if (data.general_notifications && data.general_notifications.length > 0) {
            data.general_notifications
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 10)
            .forEach(notification => {
              const li = document.createElement("li");
              li.className = "dropdown-item clickable-notification";
              li.dataset.url = notification.url || "#";
              const dot = document.createElement("span");
              dot.className = "blue-dot";

              const usernameLink = document.createElement("a");
              usernameLink.href = `/profiles/${notification.sender_id}`;
              usernameLink.textContent = notification.sender_username;
              usernameLink.className = "username-link";
              usernameLink.style.fontWeight = "bold";
              usernameLink.style.textDecoration = "underline";
              usernameLink.style.color = "#007bff";
              usernameLink.style.marginRight = "5px";

              const messageLink = document.createElement("a");
              messageLink.href = `/profiles/${notification.sender_id}` || "#";
              const createdDate = (typeof notification.created_at === "number")
                ? new Date(notification.created_at * 1000)
                : new Date(notification.created_at);
              messageLink.textContent = `${notification.message_text} ${timeAgo(createdDate)}`;
              messageLink.className = "notification-link";
              messageLink.style.textDecoration = "none";
              messageLink.style.color = "inherit";

              const wrapper = document.createElement("span");
              wrapper.appendChild(usernameLink);
              wrapper.appendChild(messageLink);

              li.appendChild(dot);
              li.appendChild(wrapper);

              li.addEventListener("mouseenter", () => {
                markSingleNotificationAsRead(notification.id, dot);
              });

              notificationDropdown.appendChild(li);
            });
            } else {
              const li = document.createElement("li");
              li.className = "dropdown-item text-muted";
              li.textContent = "No new notifications.";
              notificationDropdown.appendChild(li);
            }
          }



          const unreadCounts = data.unread_notifications || {};
  
        document.querySelectorAll("[data-convo-id]").forEach(card => {
          const convoId = card.getAttribute("data-convo-id");
          const badge = card.querySelector(".chat-unread-count");
  
          if (badge && unreadCounts[convoId] > 0) {
            badge.textContent = unreadCounts[convoId];
            badge.style.display = "inline-block";
          } else if (badge) {
            badge.style.display = "none";
          }
        });
    
          localStorage.setItem("unreadChatCount", data.chat_unread_count);
          localStorage.setItem("unreadGeneralCount", data.general_unread_count);
        })
        .catch(error => console.error("Error fetching notifications:", error));
    }
    
  
    updateUnreadMessages();
  });



  document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".notification-item").forEach((item) => {
    item.addEventListener("click", function () {
      const url = item.getAttribute("data-url");
      if (url) {
        window.location.href = url;
      }
    });

    item.addEventListener("mouseenter", function () {
      const alreadyRead = item.getAttribute("data-read") === "true";
      if (alreadyRead) return;

      const id = item.getAttribute("data-id");

      fetch(`/notifications/mark_as_read_notification/${id}`, {
        method: "POST",
        headers: {
          "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]').getAttribute("content"),
          "Content-Type": "application/json"
        },
        credentials: "same-origin"
      })
        .then(response => {
          if (response.ok) {
            item.classList.remove("bg-light");
            item.setAttribute("data-read", "true");
          }
        });
    });
  });
});


  /* Friend search bars */
document.addEventListener("DOMContentLoaded", function () {
  const toggleBtn = document.getElementById("toggle-search-button");
  const slideContainer = document.querySelector(".search-slide-container");
  const wrapper = document.querySelector(".search-slide-wrapper");
  const searchInput = document.getElementById("user-search-input");
  const form = document.getElementById("user-search-form");
  const suggestionsDropdown = document.getElementById("suggestions-dropdown");

  let isSearchActive = false;

  toggleBtn.addEventListener("click", function () {
    slideContainer.classList.add("slide-left");
    isSearchActive = true;

    setTimeout(() => {
      wrapper.style.overflow = "visible";
      searchInput.focus();
    }, 400);
  });

  document.addEventListener("click", function (event) {
    if (
      isSearchActive &&
      !wrapper.contains(event.target) &&
      !suggestionsDropdown.contains(event.target)
    ) {
      slideContainer.classList.remove("slide-left");
      isSearchActive = false;

      setTimeout(() => {
  wrapper.style.overflow = "hidden";
}, 400); 

    }
  });
});




document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('user-search-input');
  const suggestionsDropdown = document.getElementById('suggestions-dropdown');

  searchInput.addEventListener('input', function() {
    const query = this.value;

    if (query.length > 0) {
      fetch(`/search_users.json?query=${query}`)
        .then(response => response.json())
        .then(users => {
          suggestionsDropdown.innerHTML = '';
          if (users.length > 0) {
            users.forEach(user => {
              const listItem = document.createElement('li');
              listItem.textContent = user;
              listItem.classList.add('dropdown-item');
              listItem.onclick = function() {
                searchInput.value = user;
                suggestionsDropdown.style.display = 'none';
              };
              suggestionsDropdown.appendChild(listItem);
            });
            suggestionsDropdown.style.display = 'block';
          } else {
            suggestionsDropdown.style.display = 'none';
          }
        });
    } else {
      suggestionsDropdown.style.display = 'none'; 
    }
  });

  document.addEventListener('click', function(event) {
    if (!searchInput.contains(event.target) && !suggestionsDropdown.contains(event.target)) {
      suggestionsDropdown.style.display = 'none';
    }
  });
});


/* bookmarks */
function toggleBookmark(id, button, type, currentlyBookmarked) {
  const method = currentlyBookmarked ? 'DELETE' : 'POST';
  const url = type === 'message'
    ? `/messages/${id}/bookmark${method === 'DELETE' ? '/delete' : ''}`
    : `/replies/${id}/bookmark${method === 'DELETE' ? '/delete' : ''}`;

  fetch(url, {
    method: method,
    headers: {
      'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
      'Accept': 'application/json',
    }
  })
  .then(response => {
    if (!response.ok) throw new Error('Network error');
    return response.json();
  })
  .then(data => {
    const icon = button.querySelector('i');
    if (data.bookmarked) {
      icon.classList.remove('fa-regular');
      icon.classList.add('fa-solid');
      button.setAttribute('onclick', `toggleBookmark(${id}, this, '${type}', true)`);
    } else {
      icon.classList.remove('fa-solid');
      icon.classList.add('fa-regular');
      button.setAttribute('onclick', `toggleBookmark(${id}, this, '${type}', false)`);
    }
  })
  .catch(err => console.error('Error toggling bookmark:', err));
}
window.toggleBookmark = toggleBookmark;




// pagination
// saved posts
// message algoritms
// bookmarks kad nospiez nevar unbookmarkot main page un reply, un ar ajax kipa strada bet tiek redirectots uz message lapu

// EXTRA OBLIGATI

// Application.css jaatliek atpakaļ assets/styleheets sekcija lai nebutu divaini vizuali kad ieladejas

// OBLIGATI

// algoritms prieks messagiem
// gavenaja lapa jautziaisa lai bez parlades var nosutit ziņu
// janonem aizmirsi paroli funkciju
// admin history vajag uztaisit lai var sortot pec target
// admini var noņemt lietotaja profila bildi
// Biogrāfija priekš useriem profile lapā
// suggested friends tabs laba puse, chata sekcija radas info par lietotaju, un admin paneli interesanta informacija
// lietotaja profilā kad nospiez like neatnak notification

//VIZUALI OBLIGATI

// paslept/ paradit input field prieks postiem
// tad kad nospiez notification un aiziet uz messagu, tad tas message ir at the top replijos un nedaudz iekrasots
// Reply page problemas ar display image
// admin history dala tie kuri admin veic savu darbibu ir iekrasotas rindas lai var atskirt savus
// default profile pic ir offcentered
// profile bildes pozicija nesaglabajas kad to nomaina redigesanas lapa

// EXTRA

// izmantot SLUGS hash lai neraditu url ids
// Search bars kas atrod ziņas kuriem ir saistiti vardi, piemeram lietotajvards vai content vards un parada tas zinas uz ekran
// save posts
// display images var pievienot vairakus images un nospiest x uz jebkuru image
// var pieslegties ar google kontu
// Var čatot ar jebkuru personu
// file poga visas lapas divains borders kad mouse hovero over
// PAGINATION lietotāja profilā, follow un follower lista un lietotāju meklēšanas sekcijā, notifikacijas saraksta un save posts ari
