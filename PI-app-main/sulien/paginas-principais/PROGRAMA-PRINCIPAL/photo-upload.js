// ====================================================================
// ATUALIZAR FOTO DE PERFIL
// ====================================================================
async function updatePhoto() {
    const fileInput = document.getElementById("newPhoto");

    if (!fileInput || !fileInput.files || !fileInput.files[0]) {
        alert("Por favor, selecione uma foto primeiro");
        return;
    }

    // Converter foto para Base64
    const photoBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(fileInput.files[0]);
    });

    // Pegar dados do usuário logado
    const userData = JSON.parse(localStorage.getItem('sulien_user') || '{}');

    if (!userData.id) {
        alert("Erro: usuário não está logado");
        return;
    }

    try {
        const response = await fetch(`http://localhost:8080/api/users/${userData.id}/photo`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ photoBase64: photoBase64 })
        });

        if (response.ok) {
            alert("Foto atualizada com sucesso!");

            // Atualizar preview
            const currentPhoto = document.getElementById("currentPhoto");
            if (currentPhoto) currentPhoto.src = photoBase64;

            // Atualizar dados do usuário no localStorage
            userData.photoBase64 = photoBase64;
            localStorage.setItem('sulien_user', JSON.stringify(userData));

            // Limpar input
            fileInput.value = '';
        } else {
            alert("Erro ao atualizar foto");
        }
    } catch (error) {
        alert("Erro ao conectar ao servidor");
        console.error("Erro:", error);
    }
}

// Carregar foto atual quando a página carregar
window.addEventListener('DOMContentLoaded', () => {
    const userData = JSON.parse(localStorage.getItem('sulien_user') || '{}');
    const currentPhoto = document.getElementById("currentPhoto");

    if (userData.photoBase64 && currentPhoto) {
        currentPhoto.src = userData.photoBase64;
    }
});
