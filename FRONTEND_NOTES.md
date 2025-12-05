# 📝 Notas de Implementação - Frontend

## ✅ O que já está pronto

### Core
- ✅ `api-config.js` - Todas as funções de API (login, CRUD, etc)
- ✅ `index-usuario.html` - Login de usuário
- ✅ `index-adm.html` - Login de administrador
- ✅ Backend PHP completo e funcional
- ✅ Banco de dados configurado
- ✅ Docker containers prontos

## 📋 O que precisa ser atualizado (quando necessário)

Os arquivos JavaScript específicos de cada página precisarão usar as novas funções do `api-config.js`. Como você pediu para **não modificar visualmente as páginas**, apenas atualize os scripts quando for testar cada funcionalidade.

### Páginas de Administrador (ADM/)

#### 1. Gerenciamento de Usuários
**Arquivo**: `ADM/usuario.js`  
**Funções disponíveis**:
```javascript
await createUser({ nome, cpf, ra, tipo, turno, foto })
await listUsers()
await updateUser(id, { nome, tipo, turno, foto })
await deleteUser(id)
```

#### 2. Gerenciamento de Equipamentos
**Arquivo**: `ADM/equipamentos.js`  
**Funções disponíveis**:
```javascript
await createEquipment({ nome, tipo, status, foto })
await listEquipment(status) // status opcional
await updateEquipment(id, { nome, tipo, status, foto })
await deleteEquipment(id)
```

#### 3. Gerenciamento de Salas
**Arquivo**: `ADM/salas.js` (se existir)  
**Funções disponíveis**:
```javascript
await createRoom({ nome, capacidade, status, foto })
await listRooms(status) // status opcional
await updateRoom(id, { nome, capacidade, status, foto })
await deleteRoom(id)
```

#### 4. Visualização de Reservas
**Arquivo**: `ADM/reservas.js`  
**Funções disponíveis**:
```javascript
await listReservations() // Todas as reservas
await cancelReservation(id) // Admin pode cancelar qualquer uma
```

### Páginas de Professor (PROGRAMA-PRINCIPAL/)

#### 1. Fazer Reservas
**Arquivo**: `PROGRAMA-PRINCIPAL/reserva-professor.js` ou `reservas.js`  
**Funções disponíveis**:
```javascript
// Listar itens disponíveis
await listEquipment('disponivel')
await listRooms('disponivel')

// Criar reserva
await createReservation({
  tipo: 'equipamento', // ou 'sala'
  item_id: 1,
  data_inicio: '2025-12-10 08:00:00',
  data_fim: '2025-12-10 12:00:00'
})
```

#### 2. Minhas Reservas
**Arquivo**: `PROGRAMA-PRINCIPAL/historico.js`  
**Funções disponíveis**:
```javascript
await listMyReservations()
await cancelReservation(id) // Apenas suas reservas
```

#### 3. Configurações de Perfil
**Arquivo**: `PROGRAMA-PRINCIPAL/configura.js` ou `profile-photo.js`  
**Funções disponíveis**:
```javascript
// Obter perfil
await getProfile()

// Alterar senha
await updatePassword('senhaAtual', 'senhaNova')

// Alterar foto
const file = document.getElementById('fileInput').files[0]
const base64 = await fileToBase64(file)
await updatePhoto(base64)
```

## 🔧 Como Atualizar um Script

### Exemplo: Atualizar lista de usuários

**Antes** (com API antiga):
```javascript
const response = await apiPost('/users/list', {})
const users = response.data
```

**Depois** (com nova API):
```javascript
const users = await listUsers()
```

### Exemplo: Criar usuário com foto

```javascript
// Pegar dados do formulário
const nome = document.getElementById('nome').value
const cpf = document.getElementById('cpf').value
const ra = document.getElementById('ra').value
const tipo = document.getElementById('tipo').value
const turno = document.getElementById('turno').value

// Pegar foto (se houver)
let foto = null
const fileInput = document.getElementById('foto')
if (fileInput.files.length > 0) {
  foto = await fileToBase64(fileInput.files[0])
}

// Criar usuário (foto padrão será aplicada automaticamente se foto = null)
try {
  const result = await createUser({ nome, cpf, ra, tipo, turno, foto })
  alert('Usuário criado com sucesso!')
  // Recarregar lista
  loadUsers()
} catch (error) {
  alert('Erro: ' + error.message)
}
```

## 🎯 Prioridades de Teste

Quando for testar o sistema, siga esta ordem:

1. **Login** ✅ (Já está funcionando)
   - Testar login de admin
   - Testar login de professor
   - Verificar redirecionamento

2. **Cadastro de Usuários** (Admin)
   - Criar professor sem foto → verificar imagem padrão
   - Criar professor com foto
   - Editar usuário
   - Deletar usuário

3. **Cadastro de Equipamentos** (Admin)
   - Criar equipamento sem foto → verificar imagem padrão
   - Criar equipamento com foto
   - Listar equipamentos
   - Editar equipamento

4. **Cadastro de Salas** (Admin)
   - Criar sala sem foto → verificar imagem padrão
   - Criar sala com foto
   - Listar salas

5. **Reservas** (Professor)
   - Listar equipamentos disponíveis
   - Fazer reserva de equipamento
   - Listar minhas reservas
   - Cancelar reserva

6. **Perfil** (Todos)
   - Alterar senha
   - Alterar foto de perfil

## 🐛 Debugging

Se algo não funcionar:

1. **Abrir Console do Navegador** (F12)
2. **Ver Network Tab** - Verificar requisições
3. **Ver Console Tab** - Verificar erros JavaScript
4. **Ver logs do backend**:
   ```powershell
   docker-compose logs -f backend
   ```

## 📌 Notas Importantes

### Imagens Padrão
As imagens padrão estão em: `PI-app-main/sulien/paginas-principais/img2/`
- `imagem-padrao.png` - Usuários
- `sala-padrao.jpg` - Salas
- `notebook-padrao.avif` - Notebooks

O backend já está configurado para aplicá-las automaticamente quando `foto` for `null` ou vazio.

### Formato de Datas
Para reservas, use o formato: `YYYY-MM-DD HH:MM:SS`
```javascript
const dataInicio = '2025-12-10 08:00:00'
const dataFim = '2025-12-10 12:00:00'
```

### Sessão
A autenticação usa sessão PHP. O cookie é gerenciado automaticamente pelo navegador.
Não precisa enviar tokens manualmente.

### CORS
Já está configurado no backend. Se tiver problemas:
1. Verificar se backend está rodando
2. Verificar URL da API em `api-config.js` (deve ser `http://localhost:8080`)

## 🚀 Próximos Passos

1. **Iniciar o sistema**:
   ```powershell
   .\start.ps1
   ```

2. **Fazer login como admin**:
   - RA: `admin`
   - Senha: `00000000000`

3. **Testar cada funcionalidade** seguindo a ordem de prioridades acima

4. **Atualizar scripts conforme necessário** usando as funções do `api-config.js`

---

**Dúvidas?** Todas as funções estão documentadas em [api-config.js](file:///d:/leandix/PI-app-senac/PI-app-main/sulien/paginas-principais/PROGRAMA-PRINCIPAL/api-config.js)
