// File upload handler
async function uploadFile(e, currentChat, ALLOWED_EXTENSIONS, username, auth ){
    const file = e.target.files[0];

    if (!file || !currentChat) return;

    const fileSizeInBytes = file.size; // The size property returns the file size in bytes

    // 1. Get the extension (everything after the last dot)
    const fileName = file.name.toLowerCase();
    const extension = fileName.split('.').pop();
    // 2. Check Extension
    const isExtensionValid = ALLOWED_EXTENSIONS.has(extension);

    if (!isExtensionValid) {
        alert(`File type .${extension} is not supported.`);
        return;
    }

    if ( fileSizeInBytes > 26214400 ){
        alert('File Size is larger than 25MB.')
      return;
    }

    try {
        const uploadProgress = document.getElementById('uploadProgress');
        const progressFill = document.getElementById('progressFill');
        uploadProgress.classList.add('show');
        progressFill.style.width = '30%';

        const user = auth.currentUser;
        const idToken = await user.getIdToken();

        const formData = new FormData();
        formData.append('file', file);
        formData.append('username', username);

        const response = await fetch(`${WORKER_URL}/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${idToken}`
            },
            body: formData
        });

        progressFill.style.width = '60%';

        if (!response.ok) {
            throw new Error('Upload failed');
        }

        const data = await response.json();
        progressFill.style.width = '80%';

        const chatId = getChatId(username, currentChat);
	const contactRef = doc(db, `chats/${chatId}`)
        const contactmsg = `${file.name}`;
        await addDoc(collection(db, `chats/${chatId}/messages`), {
            sender: username,
            receiver: currentChat,
            fileUrl: data.url,
            fileName: file.name,
            fileType: file.type,
            timestamp: serverTimestamp()
        });
        await updateDoc(contactRef, {
            lastMessage: contactmsg,
            lastTime: serverTimestamp()
        });

        progressFill.style.width = '100%';
        setTimeout(() => {
            uploadProgress.classList.remove('show');
            progressFill.style.width = '0%';
        }, 500);

        e.target.value = '';
    } catch (error) {
        console.error('Upload error:', error);
        alert('Failed to upload file. Please try again.');
        document.getElementById('uploadProgress').classList.remove('show');
        document.getElementById('progressFill').style.width = '0%';
    }
}

export { uploadFile };
