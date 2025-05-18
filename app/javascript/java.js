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
  
  window.postReply = postReply;

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
  let shouldAutoScroll = true;
  let atBottomTimer = null;

  document.addEventListener("DOMContentLoaded", function () {
    const postButton = document.getElementById("postChat");
    const chatBox = document.querySelector(".chats-box");
    const newMessageBtn = createNewMessageButton();

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
          inputField.value = "";
        }
      })
      .catch(error => console.error("Error:", error));
  }

  function updateLastReadAt(chatId) {
    console.log("Updating last read at for chat id:", chatId);
    fetch(`/chats/${chatId}/update_last_read_at`, {
      method: "POST",
      headers: {
        "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]').getAttribute("content"),
        "Accept": "application/json"
      }
    })
      .then(response => response.json())
      .then(data => {
        console.log('Last read at updated', data);
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

function handleNewMessage() {
  const chatBox = document.querySelector(".chats-box");

  if (isNearBottom(chatBox)) {
    scrollToBottom();
    ensureUnseenDivider();
    setTimeout(() => {
      if (isNearBottom(chatBox)) {
        clearUnseen();
      }
    }, 2000);
  } else {
    ensureUnseenDivider();
    const newMessageBtn = document.getElementById("newMessageBtn");
    if (newMessageBtn) newMessageBtn.style.display = "block";
  }
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

  
  
  
  
  
  /* Notifications */
  document.addEventListener("DOMContentLoaded", function () {
   const messageNotificationCount = document.getElementById("message-notification-count");
          const generalNotificationCount = document.getElementById("notification-count");
          const notificationDropdown = document.getElementById("notifications-dropdown");
    
    function updateUnreadMessages() {
      fetch("/notifications/unread")
        .then(response => response.json())
        .then(data => {
          console.log("Unread notifications:", data);
    
         
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
              data.general_notifications.forEach(notification => {
                const li = document.createElement("li");
                li.className = "dropdown-item";
              
                const date = new Date(notification.created_at);
                const formattedDate = date.toLocaleString();
              
                const dot = document.createElement("span");
                dot.className = "blue-dot";

                const messageText = document.createElement("span");
                messageText.textContent = `${notification.message} (${formattedDate})`;

                li.appendChild(dot);
                li.appendChild(messageText);

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

  

  function debounce(func, delay) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
  }
  
  
  const debouncedMarkChatAsRead = debounce(function(conversationId) {
    console.log("Marking chat as read (debounced) for conversation ID:", conversationId);
  
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
      console.log(`Notification ${notificationId} marked as read`);
      if (element) element.style.display = "none";

    } else {
      console.error("Failed to mark notification as read:", data.error);
    }
  })
  .catch(error => console.error("Error marking notification as read:", error));
}

// EXTRA OBLIGATI

// Application.css jaatliek atpakaļ assets/styleheets sekcija lai nebutu divaini vizuali kad ieladejas

// OBLIGATI

// chata new line glitchojas, un neparadas poga scroll to bottom
// Čata sadaļā nav pareizi sent un sender vizualie izskati, vienmer ja ir current user jabut pelekais teksts tam kas suta
// PAGINATION lietotāja profilā, follow un follower lista un lietotāju meklēšanas sekcijā
// Javascript priekš čata kautkur delayed inptu value uztaisa par "" un nodzesas zinas inputs bisk delayed
// algoritms prieks messagiem
// janonem aizmirsi paroli funkciju
// reply reply sekcija neradas inputs, un image preview
// edit un delete pogas galvenaja lapa redirecto uz reply lapu
// admin history vajag uztaisit lai var sortot pec target
// gavenaja lapa jautziaisa lai bez parlades var nosutit ziņu
// reply lapā jauztaisa lai var bez parlades komentet un likot ziņas
// ja kads kommente uz tavu postu vai reply tad atnak notifikacija
// jauztais lai instantly connected uz chat channel
// default profile pic ir offcentered
// profile bildes pozicija nesaglabajas kad to nomaina redigesanas lapa
// admini var nomainit lietotaja profila bildi
// admin history dala tie kuri admin veic savu darbibu ir iekrasotas rindas lai var atskirt savus
// notifikacijam ir max limits
// chata zinam japievieno laiki
// friends chata lapa ari japievieno laiki kad tika pedeja zina sutita

// EXTRA

// Search bars kas atrod ziņas kuriem ir saistiti vardi, piemeram lietotajvards vai content vards un parada tas zinas uz ekran
// save posts
// linkos nevajadzetu redzet id un citas lietas
// suggested friends tabs laba puse, chata sekcija radas info par lietotaju, un admin paneli interesanta informacija
// galvena lapa un follower content lapa
// display images var pievienot vairakus images un nospiest x uz jebkuru image
// var pieslegties ar google kontu
// var @ot kadu reply reply sekcija
// notifikacijas lapa
// datuma linija chata japievieno
// friends page laba puse maybe parada notification vesturi
// Var čatot ar jebkuru personu
// file poga visas lapas divains borders kad mouse hovero over
