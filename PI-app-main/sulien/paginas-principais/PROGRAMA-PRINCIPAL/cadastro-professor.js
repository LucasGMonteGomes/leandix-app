document.addEventListener('DOMContentLoaded', () => {
    const userTypeSelect = document.getElementById('userType');
    const shiftGroup = document.getElementById('shiftGroup');
    const shiftSelect = document.getElementById('shift');
    const professorForm = document.getElementById('professorForm');
    const groupInfo = document.getElementById('groupInfo');

    // Mostrar/ocultar campo de turno
    userTypeSelect.addEventListener('change', () => {
        if (userTypeSelect.value === 'PROFESSOR') {
            shiftGroup.style.display = 'block';
            shiftSelect.required = true;
        } else {
            shiftGroup.style.display = 'none';
            shiftSelect.required = false;
            shiftSelect.value = '';
        }
    });

    // Submit do formulário
    professorForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const data = {
            fullName: document.getElementById('fullName').value,
            username: document.getElementById('username').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            password: document.getElementById('password').value
        };

        try {
            let result;

            if (userTypeSelect.value === 'PROFESSOR') {
                // Endpoint específico para professores
                data.shift = shiftSelect.value;
                result = await apiPost('/api/usuarios/professores', data);

                if (result.success) {
                    document.getElementById('assignedGroup').textContent = result.rotationGroup;
                    groupInfo.style.display = 'block';
                    professorForm.reset();
                    shiftGroup.style.display = 'none';

                    setTimeout(() => {
                        groupInfo.style.display = 'none';
                    }, 5000);
                } else {
                    alert('Erro ao cadastrar professor: ' + result.message);
                }
            } else {
                // Endpoint genérico para outros usuários
                data.role = userTypeSelect.value;
                result = await apiPost('/api/usuarios', data);
                alert('Usuário cadastrado com sucesso!');
                professorForm.reset();
            }

        } catch (error) {
            console.error('Erro ao cadastrar:', error);
            alert('Erro ao cadastrar usuário: ' + error.message);
        }
    });
});
