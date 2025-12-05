// ===== GERENCIAMENTO DE FOTO DE PERFIL =====

document.addEventListener('DOMContentLoaded', function () {
    const profilePhotoInput = document.getElementById('profilePhotoInput');
    const profilePhotoPreview = document.getElementById('profilePhotoPreview');
    const removePhotoBtn = document.getElementById('removePhotoBtn');

    // Carregar foto salva do usuário ao iniciar
    loadUserPhoto();

    // Event listener para quando o usuário seleciona uma foto
    if (profilePhotoInput) {
        profilePhotoInput.addEventListener('change', function (e) {
            const file = e.target.files[0];

            if (file) {
                // Validar tipo de arquivo
                if (!file.type.startsWith('image/')) {
                    alert('Por favor, selecione apenas arquivos de imagem.');
                    return;
                }

                // Validar tamanho do arquivo (máximo 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    alert('A imagem deve ter no máximo 5MB.');
                    return;
                }

                // Criar preview da imagem
                const reader = new FileReader();
                reader.onload = function (event) {
                    profilePhotoPreview.src = event.target.result;
                    // Salvar a foto no localStorage temporariamente
                    localStorage.setItem('userProfilePhoto', event.target.result);

                    // Enviar para o backend
                    uploadPhotoToBackend(event.target.result);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Event listener para remover foto
    if (removePhotoBtn) {
        removePhotoBtn.addEventListener('click', function () {
            if (confirm('Tem certeza que deseja remover sua foto de perfil?')) {
                // Restaurar foto padrão
                profilePhotoPreview.src = 'img/default-avatar.png';

                // Remover do localStorage
                localStorage.removeItem('userProfilePhoto');

                // Remover do backend
                removePhotoFromBackend();

                // Limpar input
                if (profilePhotoInput) {
                    profilePhotoInput.value = '';
                }
            }
        });
    }
});

// Função para carregar a foto do usuário
function loadUserPhoto() {
    const profilePhotoPreview = document.getElementById('profilePhotoPreview');
    if (!profilePhotoPreview) return;

    // Primeiro, tentar carregar do backend se estiver logado
    if (typeof isUserLoggedIn === 'function' && isUserLoggedIn()) {
        apiGet('/api/usuarios/me')
            .then(user => {
                if (user.photoBase64) {
                    profilePhotoPreview.src = user.photoBase64;
                    localStorage.setItem('userProfilePhoto', user.photoBase64);

                    // Atualizar outras imagens na página se houver
                    updateAllProfilePhotos(user.photoBase64);
                } else {
                    // Se não houver foto no backend (ou vier vazia), tentar localStorage ou padrão
                    useFallbackPhoto(profilePhotoPreview);
                }
            })
            .catch(error => {
                console.error('Erro ao carregar foto do usuário:', error);
                useFallbackPhoto(profilePhotoPreview);
            });
    } else {
        // Se não houver token, usar localStorage
        useFallbackPhoto(profilePhotoPreview);
    }
}

function useFallbackPhoto(imgElement) {
    const savedPhoto = localStorage.getItem('userProfilePhoto');
    if (savedPhoto) {
        imgElement.src = savedPhoto;
    }
}

// Função para enviar foto para o backend
function uploadPhotoToBackend(photoData) {
    if (typeof isUserLoggedIn === 'function' && !isUserLoggedIn()) {
        console.warn('Usuário não autenticado. Foto salva apenas localmente.');
        return;
    }

    apiPut('/api/usuarios/foto-perfil', {
        fotoPerfil: photoData
    })
        .then(user => {
            console.log('Foto de perfil atualizada com sucesso!');
            // O backend retorna o usuário atualizado com a foto em photoBase64
            if (user && user.photoBase64) {
                updateAllProfilePhotos(user.photoBase64);
                localStorage.setItem('userProfilePhoto', user.photoBase64);
            }
        })
        .catch(error => {
            console.error('Erro ao enviar foto para o backend:', error);
            alert('Erro ao salvar foto no servidor. Tente novamente.');
        });
}

// Função para remover foto do backend
function removePhotoFromBackend() {
    if (typeof isUserLoggedIn === 'function' && !isUserLoggedIn()) {
        console.warn('Usuário não autenticado.');
        return;
    }

    apiDelete('/api/usuarios/foto-perfil')
        .then(user => {
            console.log('Foto de perfil removida com sucesso!');
            // O backend retorna o usuário com a foto padrão
            if (user && user.photoBase64) {
                updateAllProfilePhotos(user.photoBase64);
                localStorage.setItem('userProfilePhoto', user.photoBase64);
            } else {
                updateAllProfilePhotos('img/default-avatar.png');
                localStorage.removeItem('userProfilePhoto');
            }
        })
        .catch(error => {
            console.error('Erro ao remover foto do backend:', error);
            alert('Erro ao remover foto no servidor.');
        });
}

// Função para atualizar todas as fotos de perfil na aplicação
function updateAllProfilePhotos(photoSrc) {
    // Atualizar todas as imagens de perfil na página
    const allProfileImages = document.querySelectorAll('.user-short img, .profile-photo img, #profilePhotoPreview');
    allProfileImages.forEach(img => {
        img.src = photoSrc;
    });
}
