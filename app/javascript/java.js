/* failu pirmskats */
function displayFileName() {
    const fileInput = document.getElementById('fileInput');
    const previewContainer = document.getElementById('filePreview');
    const file = fileInput.files[0];
  
    previewContainer.innerHTML = ''; 
  
    if (file) {
  const previewWrapper = document.createElement('div');
  previewWrapper.classList.add('preview-wrapper');
  previewWrapper.style.position = 'relative';

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
    previewWrapper.appendChild(imgPreview);
  } else if (file.type.match('video.*')) {
    const videoPreview = document.createElement('video');
    videoPreview.src = URL.createObjectURL(file);
    videoPreview.controls = true;
    videoPreview.classList.add('preview-video');
    previewWrapper.appendChild(videoPreview);
  }

  previewWrapper.appendChild(removeBtn);
  previewContainer.appendChild(previewWrapper);
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

    const icon = button.querySelector('i');
    icon.classList.add('animate');
    icon.addEventListener('animationend', () => {
      icon.classList.remove('animate');
    }, { once: true });

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

    const icon = button.querySelector('i');
    icon.classList.add('animate');
    icon.addEventListener('animationend', () => {
      icon.classList.remove('animate');
    }, { once: true });

    likeCountSpan.innerText = data.likes_count;
  })
  .catch(error => console.error('Error:', error));
}


  
  window.toggleReplyLike = toggleReplyLike;
  
  
  
  /* Taustiņu aktivizācija */
  let isPosting   = false;

  document.addEventListener("DOMContentLoaded", function () {
  const inputField = document.getElementById("inputField");
  const fileInput  = document.getElementById("fileInput");

  if (inputField) {
    inputField.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        postComment();
      }
    });
  }
});
  
  
  // Ziņu publicēšana
function postComment() {
  if (isPosting) return;
    isPosting = true;
  const inputField = document.getElementById('inputField');
  const fileInput = document.getElementById('fileInput');
  const messageContent = inputField.value;
  const file = fileInput.files[0];

  if (messageContent.trim() === "" && !file) {
    alert("Please enter a message");
    isPosting = false;
    return;
  }
  inputField.disabled = true;
    fileInput.disabled  = true;

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
      return response.text();
    } else if (response.status === 401) {
      window.location.href = '/users/sign_in';
    } else {
      throw new Error("Could not create message.");
    }
  })
  .then(html => {
    if (html) {
      const postContainer = document.getElementById('post-container');
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html.trim();
      const newPost = tempDiv.firstElementChild;
      postContainer.prepend(newPost);

      inputField.value = '';
      fileInput.value = '';
      document.getElementById('fileInfo').innerHTML = '';
      document.getElementById('filePreview').innerHTML = '';

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  })
  .catch(error => {
    console.error('Error:', error);
  })
  .finally(() => {
        isPosting = false;
        inputField.disabled = false;
        fileInput.disabled  = false;
      });
}

window.postComment = postComment;


  document.addEventListener("turbo:frame-load", function(event) {
  if (event.target.id === "feedContainer") {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }
});

document.addEventListener('DOMContentLoaded', function () {
  const toggleButtons       = document.querySelectorAll('#toggleInputField');
  const mainInputWrapper    = document.getElementById('inputWrapper');
  const replyInputWrapper   = document.getElementById('replyInputWrapper');
  const replyContent        = document.getElementById('reply-content');
  const replyParentId       = document.getElementById('reply-parent-id');
  toggleButtons.forEach((button) => {
    button.addEventListener('click', function (event) {
      event.stopPropagation();
      if (mainInputWrapper)  mainInputWrapper.classList.add('show');
      if (replyInputWrapper) replyInputWrapper.classList.add('show');
    });
  });

  const replyBlocks = document.querySelectorAll('.clickable-reply');
  replyBlocks.forEach((block) => {
    block.addEventListener('click', function (event) {
      if (event.target.closest('button, a, svg, path')) return;

      if (event.target.closest('#filePreview'))       return;
      if (event.target.closest('#replyFilePreview'))  return;
      if (event.target.closest('.remove-file-btn'))   return;

      event.stopPropagation();
      if (mainInputWrapper)  mainInputWrapper.classList.add('show');
      if (replyInputWrapper) replyInputWrapper.classList.add('show');

      const replyId   = block.dataset.replyId;
      const username  = block.dataset.replyUsername;
      if (replyParentId) {
        replyParentId.value = replyId;
      }
      if (replyContent && !replyContent.value.includes(`@${username}`)) {
        replyContent.value = `@${username} ` + replyContent.value;
        replyContent.focus();
      }
    });
  });

  document.addEventListener('click', function (event) {
    const clickedOnToggle = [...toggleButtons].some(btn =>
      btn.contains(event.target)
    );
    if (clickedOnToggle) {
      return;
    }

    if (event.target.closest('#filePreview'))      return;
    if (event.target.closest('#replyFilePreview')) return;
    if (event.target.closest('.remove-file-btn'))  return;

    if (mainInputWrapper && !mainInputWrapper.contains(event.target)) {
      mainInputWrapper.classList.remove('show');
    }

    if (replyInputWrapper && !replyInputWrapper.contains(event.target)) {
      replyInputWrapper.classList.remove('show');
    }
  });
});



let isReplying = false;
let currentParentReplyId = null;

function postReply(event) {
  event.preventDefault();
    if (isReplying) return;
    isReplying = true;
  event.preventDefault();

  const replyInputField     = document.getElementById('replyInputField');
  const mentionedUsername   = document.getElementById('dynamic-reply-mentioned-username').value.trim();
  let   replyText           = replyInputField.value.trim();
  const shouldMention       = document.getElementById('replying-to-should-mention').value === "1";

  if (mentionedUsername && currentParentReplyId && shouldMention) {
    replyText = `@${mentionedUsername} ${replyText}`;
  }

  const replyFileInput         = document.getElementById('replyFileInput');
  const file                   = replyFileInput.files[0];
  const replyPreviewContainer  = document.getElementById('replyFilePreview');
  const parentIdInput          = document.getElementById('dynamic-reply-parent-id');
  const submitButton           = document.getElementById('replySubmitButton');

  if (!replyText && !file) {
    alert('Please enter a message or a file to post it.');
    isReplying = false;
    return;
  }

  submitButton.disabled = true;
    replyInputField.disabled = true;
    replyFileInput.disabled = true;

  const formData = new FormData();
  if (replyText) formData.append('reply[content]', replyText);
  if (file)      formData.append('reply[file]', file);
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
          const parentReplyElement    = document.querySelector(`#reply-${currentParentReplyId}`);
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

      replyInputField.value            = '';
      replyFileInput.value             = '';
      replyPreviewContainer.innerHTML  = '';
      parentIdInput.value              = '';
      document.getElementById('replying-to-label').style.display = 'none';

      if (currentParentReplyId) {
        const parentCommentCountSpan = document.getElementById(`comment-count-${currentParentReplyId}`);
        if (parentCommentCountSpan) {
          const match       = parentCommentCountSpan.innerText.match(/\d+/);
          const currentCount= match ? parseInt(match[0], 10) : 0;
          const newCount    = currentCount + 1;
          parentCommentCountSpan.innerText = `${newCount} comment${newCount !== 1 ? 's' : ''}`;
        }
      } else {
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
      isReplying = false;
      submitButton.disabled       = false;
      replyInputField.disabled    = false;
      replyFileInput.disabled     = false;    
    });
}

window.postReply = postReply;

export function bindClickableReplyEvent(replyElement) {
  if (!replyElement || !replyElement.classList.contains('clickable-reply')) return;

  replyElement.addEventListener("click", function (e) {
    if (e.target.closest("a") || e.target.closest("button") || e.target.closest("i")) return;

    const clickedReply     = e.currentTarget;
    currentParentReplyId  = clickedReply.dataset.parentId || clickedReply.dataset.messageId;

    const isParentReply   = !clickedReply.dataset.parentId; 
    const username         = clickedReply.dataset.replyUsername;
    const replyId         = clickedReply.dataset.replyId;

    document.getElementById("dynamic-reply-parent-id").value         = replyId;
    document.getElementById("dynamic-reply-mentioned-username").value = username;

    const inputField = document.getElementById("replyInputField");

    if (isParentReply) {
      document.getElementById("replying-to-should-mention").value = "0";
    } else {
      document.getElementById("replying-to-should-mention").value = "1";
    }
    document.getElementById("replying-to-username").textContent = "@" + username;
    document.getElementById("replying-to-label").style.display = "flex";
    inputField.focus();

    e.stopPropagation();
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const parentIdInput       = document.getElementById("dynamic-reply-parent-id");
  const replyingToLabel     = document.getElementById("replying-to-label");
  const mentionedUsername   = document.getElementById("dynamic-reply-mentioned-username");

  replyingToLabel.style.display = "none";

  document.querySelectorAll(".clickable-reply").forEach(bindClickableReplyEvent);

  window.clearReplyTarget = function () {
    parentIdInput.value              = "";
    replyingToLabel.style.display    = "none";
    currentParentReplyId             = null;
    mentionedUsername.value          = "";
  };

    document.addEventListener("click", function (e) {
    if (e.target.closest(".clickable-reply")) {
      return;
    }

    if (
      e.target.closest("#replyInputField")       ||
      e.target.closest("#replySubmitButton")     ||
      e.target.closest("#replyFileInput")        ||
      e.target.closest("#replyFilePreview")      ||
      e.target.closest(".remove-file-btn")
    ) {
      return;
    }

    clearReplyTarget();
  });
});




  
  
  
  
  
  /* profila bildes pirmskats */
  document.addEventListener('DOMContentLoaded', function () {
  let cropper;
const imageInput = document.getElementById('profile_picture_input');
const modalImage = document.getElementById('modal-crop-image');
const cropModalEl = document.getElementById('cropModal');
const cropModal = new bootstrap.Modal(cropModalEl);
const cropAndSaveBtn = document.getElementById('cropAndSaveBtn');

imageInput.addEventListener('change', function (event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      modalImage.src = e.target.result;
      cropModal.show();
    };
    reader.readAsDataURL(file);
  }
});

cropModalEl.addEventListener('shown.bs.modal', function () {
  if (cropper) {
    cropper.destroy();
  }

  cropper = new Cropper(modalImage, {
    aspectRatio: 1,
    viewMode: 1,
    autoCropArea: 1,
    dragMode: 'move',
  });
});

cropModalEl.addEventListener('hidden.bs.modal', function () {
  if (cropper) {
    cropper.destroy();
    cropper = null;
  }
});

cropAndSaveBtn.addEventListener('click', function () {
  if (cropper) {
    const canvas = cropper.getCroppedCanvas({
      width: 200,
      height: 200,
    });

    canvas.toBlob(function (blob) {
      const file = new File([blob], 'cropped.png', { type: 'image/png' });

      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      imageInput.files = dataTransfer.files;

      const previewImage = document.getElementById('preview-image');
      previewImage.src = URL.createObjectURL(file);
      cropModal.hide();
    }, 'image/png');
  }
});

});

/* settingi */
document.addEventListener("DOMContentLoaded", () => {
  const saveBtn = document.getElementById("confirm-changes-btn");

  const setupValidator = (fieldId, feedbackId, toggleSave = false) => {
    const field = document.getElementById(fieldId);
    const feedback = document.getElementById(feedbackId);

    field.addEventListener("input", () => {
      const len = field.value.length;

      if (len > 0 && len < 6) {
        field.classList.add("is-invalid");
        feedback.style.display = "block";
      } else {
        field.classList.remove("is-invalid");
        feedback.style.display = "none";
      }

      if (toggleSave) {
        saveBtn.disabled = (len > 0 && len < 6);
      }
    });
  };

  setupValidator("password-field", "password-feedback", true);
  setupValidator("password-confirmation-field", "password-confirmation-feedback");
});


  /* chats */
  let atBottomTimer = null;
  let newMessageBtn = null;


  document.addEventListener("DOMContentLoaded", function () {
    const postButton = document.getElementById("postChat");
    const chatBox = document.querySelector(".chats-box");

      newMessageBtn = createNewMessageButton();
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

     setTimeout(() => {
      const isScrollable = chatBox.scrollHeight > chatBox.clientHeight;
      const divider = document.querySelector(".unseen-divider");
      const chatId = chatBox?.dataset.chatConversationId;
      if (!isScrollable && divider) {
        divider.remove();
        updateLastReadAt(chatId);
        clearUnseen();
      }
    }, 2000);

    setTimeout(() => {
    scrollToBottom();
  }, 0);
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
    inputField.style.height = 'auto';



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
  let existing = document.getElementById("newMessageBtn");
  if (existing) return existing;

  const btn = document.createElement("button");
  btn.id = "newMessageBtn";
  btn.innerText = "New message";
  btn.style.cssText = `
    position: absolute;
    bottom: 90px;
    right: 30%;
    left: 30%;
    border: none;
    background: #db1717;
    font-weight: bold;
    font-family: initial;
    color: rgb(255 255 255);
    border-radius: 20px;
    cursor: pointer;
    display: none;
    z-index: 1000;
    box-shadow: rgba(0, 0, 0, 0.2) 0px 2px 6px;
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
  const chatId = chatBox?.dataset.chatConversationId;
  if (!chatBox) return;

  const isAtBottom = isNearBottom(chatBox);
  const unseenMessages = document.querySelectorAll(".chat-message.unseen");

  if (atBottomTimer) clearTimeout(atBottomTimer);

  if (isAtBottom) {
    newMessageBtn.style.display = "none";
    debouncedMarkChatAsRead(chatId);

    atBottomTimer = setTimeout(() => {
      if (isNearBottom(chatBox)) {
        clearUnseen();
        updateLastReadAt(chatId);
      }
    }, 2000);
  } else {
    if (unseenMessages.length > 0) {
      ensureUnseenDivider();
      newMessageBtn.style.display = "block";
    } else {
      newMessageBtn.style.display = "none";
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



 
function waitForStableChatAndScroll() {
  let lastHeight = 0;
  let sameHeightCount = 0;
  const chatBox = document.querySelector(".chats-box");

  function check() {
    if (!chatBox) return;
    const currentHeight = chatBox.scrollHeight;

    if (currentHeight === lastHeight) {
      sameHeightCount++;
    } else {
      sameHeightCount = 0;
      lastHeight = currentHeight;
    }

    if (sameHeightCount >= 3) {
      scrollToFirstUnseenOrBottom();
    } else {
      requestAnimationFrame(check);
    }
  }

  check();
}

document.addEventListener("DOMContentLoaded", () => {
  const chatBox = document.querySelector(".chats-box");
  if (chatBox) {
    chatBox.addEventListener("scroll", handleScroll);
    waitForStableChatAndScroll();
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


 document.addEventListener("DOMContentLoaded", () => {
  document.body.addEventListener("ajax:success", function (event) {
    const button = event.target;
    if (button.classList.contains("close-chat-button")) {
      const convoId = button.dataset.convo_id;
      const card = document.querySelector(`.chat-card-users[data-convo-id='${convoId}']`);
      if (card) {
        card.remove();
      }
    }
  });

  document.body.addEventListener("ajax:error", function (event) {
    console.error("Failed to hide chat:", event.detail);
  });
});



document.addEventListener('input', function (event) {
  if (event.target.classList.contains('auto-resize-input')) {
    const el = event.target;

    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'; 

    if (el.scrollHeight > 115) {
      el.style.overflowY = 'auto';
    } else {
      el.style.overflowY = 'hidden';
    }
  }
});



document.addEventListener("DOMContentLoaded", () => {
  const inputField = document.getElementById("inputField_chat");
  const postButton = document.getElementById("postChat");

  if (inputField) {
    inputField.addEventListener("keydown", function(event) {
      if (event.key === "Enter") {
        event.preventDefault();
        postButton.click();
      }
    });
  }
});


/* Notifications */ 
 
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
                       
                        const currentUserId = data.current_user_id;

                        const filteredNotifications = data.general_notifications.filter(notification => {
                            return notification.sender_id !== currentUserId;
                        });


                        if (filteredNotifications.length > 0) {
                            filteredNotifications
  .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  .forEach(notification => {
    const li = document.createElement("li");
    li.className = "dropdown-item d-flex align-items-start gap-2 clickable-notification";
    li.dataset.url = notification.url || "#";

    const dot = document.createElement("span");
    dot.className = "blue-dot mt-1";

    const profileImgLink = document.createElement("a");
profileImgLink.href = `/profiles/${notification.sender_id}`;

const profileImg = document.createElement("img");
profileImg.src = notification.sender_avatar_url;
profileImg.alt = "Avatar";
profileImg.className = "rounded-circle mt-1";
profileImg.style.width  = "32px";
profileImg.style.height = "32px";
profileImg.style.objectFit       = "cover";
profileImg.style.backgroundColor = notification.sender_avatar_color;

profileImgLink.appendChild(profileImg);


    const textWrapper = document.createElement("div");
    textWrapper.className = "d-flex flex-column justify-content-center";

    const usernameLink = document.createElement("a");
    usernameLink.href = `/profiles/${notification.sender_id}`;
    usernameLink.textContent = notification.sender_username;
    usernameLink.className = "username-link";
    usernameLink.style.fontWeight    = "bold";
    usernameLink.style.textDecoration= "none";
    usernameLink.style.color         = "white";

    const messageLink = document.createElement("a");
    messageLink.href = notification.url || "#";
    messageLink.textContent = `${notification.message_text}`;
    messageLink.className = "notification-link";
    messageLink.style.textDecoration = "none";
    messageLink.style.color          = "inherit";

const createdDate = typeof notification.created_at === "number"
  ? new Date(notification.created_at * 1000)
  : new Date(notification.created_at);

    const timeText = document.createElement("small");
    timeText.textContent = timeAgo(createdDate);
    timeText.style.fontSize   = "0.75rem";
    timeText.style.color      = "#888";
    timeText.style.display    = "block";

    textWrapper.appendChild(usernameLink);
    textWrapper.appendChild(messageLink);
    textWrapper.appendChild(timeText);

    const mediaWrapper = document.createElement("div");
    mediaWrapper.className = "d-flex gap-2";
    mediaWrapper.appendChild(profileImgLink);
    mediaWrapper.appendChild(textWrapper);

    li.appendChild(dot);
    li.appendChild(mediaWrapper);

    li.addEventListener("mouseenter", () => {
      if (!li.dataset.markedRead) {
        markSingleNotificationAsRead(notification.id, dot);
        li.dataset.markedRead = "true";
         if (dot && dot.parentNode) {
      dot.remove();
    }
      }
    });

    notificationDropdown.appendChild(li);
  });

                        } else {
                             const li = document.createElement("li");
                             li.className = "dropdown-item text-muted";
                             li.textContent = "No new notifications.";
                             notificationDropdown.appendChild(li);
                        }
                    } else {
                        const li = document.createElement("li");
                        li.className = "dropdown-item text-muted";
                        li.textContent = "No new notifications.";
                        notificationDropdown.appendChild(li);
                    }
                }

                if (generalNotificationCount) {
                    const filteredGeneralCount = data.general_notifications.filter(notification => notification.sender_id !== data.current_user_id).length;
                    if (filteredGeneralCount > 0) {
                         generalNotificationCount.textContent = filteredGeneralCount;
                         generalNotificationCount.style.display = "inline-block";
                    } else {
                         generalNotificationCount.style.display = "none";
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

      



document.addEventListener("DOMContentLoaded", function () {

  document.querySelectorAll(".notification-item").forEach((item) => {
    item.addEventListener("click", function () {
      const url = item.getAttribute("data-url");
      if (url) {
        window.location.href = url;
      }
    });

  
  });
});

window.handleNotificationHover = function(notificationId, element) {
  if (element.dataset.read === "true") return;
  
  element.dataset.read = "true";
  element.classList.remove("bg-dark");
  element.classList.add("notification-read");
  
  markSingleNotificationAsRead(notificationId);
};

function markSingleNotificationAsRead(notificationId) {
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

      const countElement = document.getElementById("notification-count");
      let currentCount = parseInt(countElement.textContent || "0", 10);
      if (currentCount > 0) {
        currentCount -= 1;
        countElement.textContent = currentCount;
        if (currentCount === 0) {
          countElement.style.display = "none";
        }
      }

      const storedGeneral = parseInt(localStorage.getItem("unreadGeneralCount") || "0", 10);
      localStorage.setItem("unreadGeneralCount", Math.max(storedGeneral - 1, 0));
    } else {
      console.error("Failed to mark notification as read:", data.error);
    }
  })
  .catch(error => {
    console.error("Error marking notification as read:", error);
  });
}


  /* Friend search bars */
document.addEventListener("DOMContentLoaded", () => {
  const toggleButtons = document.querySelectorAll(".toggle-search-button");
  const wrappers      = document.querySelectorAll(".search-slide-wrapper");

  wrappers.forEach((wrapper, idx) => {
    const toggleBtn           = toggleButtons[idx];
    const slideContainer      = wrapper.querySelector(".search-slide-container");
    const searchInput         = wrapper.querySelector(".user-search-input");
    const suggestionsDropdown = wrapper.querySelector(".suggestions-dropdown");
    let   isSearchActive      = false;

    toggleBtn.addEventListener("click", () => {
      slideContainer.classList.add("slide-left");
      toggleBtn.classList.add("hidden"); 
      isSearchActive = true;
      setTimeout(() => {
        wrapper.style.overflow = "visible";
        searchInput.focus();
      }, 400);
    });

    document.addEventListener("click", (e) => {
      if (
        isSearchActive &&
        !wrapper.contains(e.target) &&
        !suggestionsDropdown.contains(e.target)
      ) {
        slideContainer.classList.remove("slide-left");
        isSearchActive = false;
        setTimeout(() => {
          wrapper.style.overflow = "hidden";
          toggleBtn.classList.remove("hidden");
        }, 400);
      }
    });

    searchInput.addEventListener("input", function() {
      const q = encodeURIComponent(this.value);
      if (!q) {
        suggestionsDropdown.style.display = "none";
        return;
      }

      fetch(`/search_users.json?query=${q}`)
        .then(r => r.json())
        .then(users => {
          suggestionsDropdown.innerHTML = "";
          if (users.length) {
            users.forEach(u => {
              const li = document.createElement("li");
              li.textContent = u;
              li.classList.add("dropdown-item");
              li.addEventListener("click", () => {
                searchInput.value = u;
                suggestionsDropdown.style.display = "none";
              });
              suggestionsDropdown.appendChild(li);
            });
            suggestionsDropdown.style.display = "block";
          } else {
            suggestionsDropdown.style.display = "none";
          }
        });
    });
  });
});




/* bookmarks */
function toggleBookmark(id, button, type) {
  const currentlyBookmarked = button.dataset.bookmarked === 'true';

  const method = currentlyBookmarked ? 'DELETE' : 'POST';
  const url = type === 'message'
    ? `/messages/${id}/bookmark`
    : `/replies/${id}/bookmark${method === 'DELETE' ? '' : ''}`;

  fetch(url, {
    method: method,
    headers: {
      'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content,
      'Accept': 'application/json',
    }
  })
  .then(response => {
    if (!response.ok) {
      return response.json().then(errorData => {
        throw new Error(`Network error: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
      });
    }
    return response.json();
  })
  .then(data => {
    const icon = button.querySelector('i');

    if (data.bookmarked) {
      icon.classList.remove('fa-regular');
      icon.classList.add('fa-solid');
      button.dataset.bookmarked = 'true';
    } else {
      icon.classList.remove('fa-solid');
      icon.classList.add('fa-regular');
      button.dataset.bookmarked = 'false';
    }

    icon.classList.add('animate');
    icon.addEventListener('animationend', () => {
      icon.classList.remove('animate');
    }, { once: true });
  })
  .catch(err => console.error('Error toggling bookmark:', err));
}

window.toggleBookmark = toggleBookmark;



/* follow */

function toggleFollow(userId, button) {
  const currentlyFollowing = button.dataset.following === 'true';
  const method = currentlyFollowing ? 'DELETE' : 'POST';
  const url = `/profiles/${userId}/${currentlyFollowing ? 'unfollow' : 'follow'}`;

  fetch(url, {
    method: method,
    headers: {
      'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content,
      'Accept': 'application/json',
    }
  })
  .then(response => {
    if (response.status === 401 || response.status === 403) {
      window.location.href = '/users/sign_in';
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      return response.text().then(text => {
        console.error(`Server response status ${response.status}:`, text);
        try {
          const errorData = JSON.parse(text);
          throw new Error(`Server error: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
        } catch (e) {
          throw new Error(`Server error: ${response.status} ${response.statusText} - Response was not JSON.`);
        }
      });
    }

    return response.json();
  })
  .then(data => {
    if (data.following) {
      button.textContent = 'Unfollow';
      button.classList.remove('follow');
      button.classList.add('unfollow');
      button.dataset.following = 'true';
    } else {
      button.textContent = 'Follow';
      button.classList.remove('unfollow');
      button.classList.add('follow');
      button.dataset.following = 'false';
    }

    const followerCountSpan = document.getElementById(`follower-count-${userId}`);
    if (followerCountSpan) {
      followerCountSpan.textContent = data.followers_count;
    }

    const friendStatusContainer = document.getElementById(`friend-status-container-${userId}`);
    if (friendStatusContainer) {
      if (data.friends_with) {
        friendStatusContainer.innerHTML = '<span class="friend-status"><i class="fa-solid fa-user-group"></i></span>';
      } else {
        friendStatusContainer.innerHTML = ''; 
      }
    }
  })
  .catch(error => {
    console.error('Error toggling follow status:', error);
  });
}

window.toggleFollow = toggleFollow;

/* color switcher */
document.addEventListener("DOMContentLoaded", function () {
  const toggle = document.getElementById("theme-toggle");
  const body = document.body;

  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light") {
    body.classList.add("light-mode");
    toggle.checked = false;
  } else if (savedTheme === "dark") {
    body.classList.add("dark-mode");
    toggle.checked = true;
  }

  toggle.addEventListener("change", function () {
    if (toggle.checked) {
      body.classList.remove("light-mode");
      body.classList.add("dark-mode");
      localStorage.setItem("theme", "dark");
    } else {
      body.classList.remove("dark-mode");
      body.classList.add("light-mode");
      localStorage.setItem("theme", "light");
    }
  });
});


/* reposition */
document.addEventListener("DOMContentLoaded", function () {
  const notificationItem = document.getElementById("notification-item");
  const chatItem = document.getElementById("chat-item");
  const postButtonWrapper = document.getElementById("post-button-wrapper");

  const originalNotificationParent = notificationItem?.parentElement;
  const originalChatParent = chatItem?.parentElement;
  const originalPostParent = postButtonWrapper?.parentElement;

  const mobileFooter = document.getElementById("mobile-footer-content");

  function moveElements() {
    if (window.innerWidth <= 991) {
      if (mobileFooter) {
        mobileFooter.innerHTML = '';

        if (notificationItem) {
          mobileFooter.appendChild(notificationItem);
          notificationItem.classList.add("mobile-no-margin", "mobile-icon-lg");
        }

        

        if (postButtonWrapper) {
          mobileFooter.appendChild(postButtonWrapper);
          const postBtn = document.getElementById("toggleInputField");
          if (postBtn) {
            postBtn.classList.add("mobile-post-btn");
            postBtn.innerHTML = '<i class="fa fa-plus" style="color:black;"></i>';
          }
        }

        if (chatItem) {
          mobileFooter.appendChild(chatItem);
          chatItem.classList.add("mobile-no-margin", "mobile-icon-lg", "hide-chat-text");
        }
      }
    } else {
      if (notificationItem && originalNotificationParent && !originalNotificationParent.contains(notificationItem)) {
        originalNotificationParent.appendChild(notificationItem);
        notificationItem.classList.remove("mobile-no-margin", "mobile-icon-lg");
      }

      if (chatItem && originalChatParent && !originalChatParent.contains(chatItem)) {
        originalChatParent.appendChild(chatItem);
        chatItem.classList.remove("mobile-no-margin", "mobile-icon-lg", "hide-chat-text");
      }

      if (postButtonWrapper && originalPostParent && !originalPostParent.contains(postButtonWrapper)) {
        originalPostParent.appendChild(postButtonWrapper);
      }

      const postBtn = document.getElementById("toggleInputField");
      if (postBtn) {
        postBtn.classList.remove("mobile-post-btn");
        postBtn.innerHTML = 'POST';
      }
    }
  }

  moveElements();
  window.addEventListener("resize", moveElements);
});

/* notification black screen */
document.addEventListener("DOMContentLoaded", () => {
  const dropdown = document.getElementById("notifications-dropdown");
  const overlay = document.getElementById("notification-overlay");

  document.getElementById("notification-toggle").addEventListener("click", () => {
    const isOpen = dropdown.classList.toggle("show");

    if (isOpen) {
      overlay.classList.remove("d-none");
    } else {
      overlay.classList.add("d-none");
    }
  });

  overlay.addEventListener("click", () => {
    dropdown.classList.remove("show");
    overlay.classList.add("d-none");
  });
});

/* edit page mage change */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.ep-input-file').forEach(input => {
    const previewId = input.id === 'ep-message-file-input'
      ? 'ep-message-current-file-preview'
      : 'ep-current-file-preview';
    const preview = document.getElementById(previewId);
    if (!preview) return;

    input.addEventListener('change', () => {
      const file = input.files[0];
      if (!file) return;

      preview.innerHTML = '<p class="ep-current-file-label">Selected file:</p>';
      preview.style.display = 'block';
      if (file.type.startsWith('image/')) {
        const img = document.createElement('img');
        img.className = 'ep-current-image';
        img.src = URL.createObjectURL(file);
        img.onload = () => URL.revokeObjectURL(img.src);
        preview.appendChild(img);
      } else {
        const link = document.createElement('a');
        link.className = 'ep-current-download';
        link.textContent = file.name;
        link.href = '#';
        preview.appendChild(link);
      }
    });
  });
});


/* description */
window.toggleDescriptionEdit = function(showForm) {
  document.getElementById("description-display").style.display = showForm ? "none" : "flex";
  document.getElementById("description-form").style.display = showForm ? "flex" : "none";
};
