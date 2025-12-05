// ===========================================
//  BOTÕES DE NAVEGAÇÃO
// ===========================================
const navBtns = document.querySelectorAll(".nav-btn");

navBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".nav-btn.active")?.classList.remove("active");
        btn.classList.add("active");
    });
});

// ===========================================
//  LOGOUT
// ===========================================
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        alert("Logout realizado!");
    });
}

// ===========================================
//  TRADUÇÕES (IDIOMAS)
// ===========================================
const traducoes = {
    pt: {
        // MENU
        menu_home: "Home",
        menu_user: "Usuário",
        menu_reservations: "Reservas",
        menu_settings: "Configurações",
        logout: "Sair",

        // CONFIG
        title: "Configurações",
        notifications: "Notificações",
        receive_notifications: "Receber notificações",
        yes: "Sim",
        no: "Não",
        security: "Segurança",
        current_password: "Senha atual",
        new_password: "Nova senha",
        confirm_password: "Confirmar senha",
        change_password: "Alterar senha",
        preferences: "Preferências",
        theme: "Tema do sistema",
        language: "Idioma",

        // PROFILE PHOTO
        profile_photo: "Foto de Perfil",
        change_photo: "Alterar foto de perfil",
        select_photo: "Selecionar foto",
        remove_photo: "Remover foto",

        // USER PAGE
        user_fullname: "Nome Completo:",
        user_class: "Turma:",
        user_room: "Sala:",
        user_ra: "R.A:",
        user_email: "E-mail:",
        user_phone: "Número:",
        user_history: "Histórico",

        // HOME
        home_title: "Bem-vindo",
        home_subtitle: "Informações do sistema",

        // RESERVAS
        reservations_title: "Reservas",
        reservations_list: "Lista de reservas",

        reserva_step: "Reserva — passo",
        reserva_of: "de",
        skip_rooms: "Pular aluguel de salas",
        skip_equipment: "Pular equipamentos",
        confirm_reservation: "Confirmar Reserva",

        home_title: "Leandix — Armazenamento de Equipamentos",
        menu_home: "Home",
        menu_usuario: "Usuário",
        menu_reservas: "Reservas",
        menu_config: "Configurações",
        menu_sair: "Sair",
        home_page: "Home",
        home_role: "Aluno",
        home_class: "Turma:",
        home_room: "Sala:",
        home_borrowed: "Emprestados",
        home_reservations: "Reservas",
        home_limit: "Limite",
        calendar_prev: "Mês anterior",
        calendar_next: "Próximo mês",
        week_sun: "Dom",
        week_mon: "Seg",
        week_tue: "Ter",
        week_wed: "Qua",
        week_thu: "Qui",
        week_fri: "Sex",
        week_sat: "Sab",
        week_sun_short: "D",
        week_mon_short: "S",
        week_tue_short: "T",
        week_wed_short: "Q",
        week_thu_short: "Q",
        week_fri_short: "S",
        week_sat_short: "S",
        modal_title: "Confirmar",
        modal_cancel: "Cancelar",
        modal_confirm: "Confirmar",

        calendar_weeks: "Semanas:",
        calendar_click: "Clique numa data (domingo está desabilitado). O sistema seleciona um bloco de 7 dias automaticamente.",
        calendar_align: "Alinhar a segunda-feira",
        rooms_title: "Salas disponíveis",
        rooms_subtitle: "Escolha as salas que deseja alugar para o período selecionado. Ou pule este passo para não alugar salas.",
        equipment_title: "Equipamentos",
        equipment_subtitle: "Escolha os equipamentos (opcional). Você pode pular.",
        summary_title: "Resumo da Reserva",
        obs_label: "Observações (opcional)",
        btn_back: "← Voltar",
        btn_next: "Próximo →",
        modal_reserva: "Excluir reserva",
        usuario_label: "Usuário:",
        add_user: "Adicionar novo usuário",
        user_photo: "Foto do usuário",
        register_user: "Cadastrar Usuário",
        label_fullname: "Nome completo:",
        label_email: "E-mail:",
        label_ra: "R.A:",
        label_area: "Área:",
        label_phone: "Telefone:",
        btn_register: "Cadastrar",
        btn_cancel: "Cancelar",

        menu_reservas: "Reservas",
        menu_home: "Home",
        menu_usuario: "Usuário",
        menu_config: "Configurações",
        menu_sair: "Sair",
        btn_delete_reservation: "Excluir reserva",
        btn_back: "Voltar",
        add_equipment: "adicionar equipamento"

    },

    en: {
        // MENU
        menu_home: "Home",
        menu_user: "User",
        menu_reservations: "Reservations",
        menu_settings: "Settings",
        logout: "Logout",

        // CONFIG
        title: "Settings",
        notifications: "Notifications",
        receive_notifications: "Receive notifications",
        yes: "Yes",
        no: "No",
        security: "Security",
        current_password: "Current password",
        new_password: "New password",
        confirm_password: "Confirm password",
        change_password: "Change password",
        preferences: "Preferences",
        theme: "System theme",
        language: "Language",

        // PROFILE PHOTO
        profile_photo: "Profile Photo",
        change_photo: "Change profile photo",
        select_photo: "Select photo",
        remove_photo: "Remove photo",

        // USER PAGE
        user_fullname: "Full Name:",
        user_class: "Class:",
        user_room: "Room:",
        user_ra: "Registration ID:",
        user_email: "Email:",
        user_phone: "Phone:",
        user_history: "History",

        // HOME
        home_title: "Welcome",
        home_subtitle: "System information",

        // RESERVAS
        reservations_title: "Reservations",
        reservations_list: "Reservations list",


        reserva_step: "Reservation — step",
        reserva_of: "of",
        skip_rooms: "Skip room rental",
        skip_equipment: "Skip equipment",
        confirm_reservation: "Confirm Reservation",

        home_title: "Leandix — Equipment Storage",
        menu_home: "Home",
        menu_usuario: "User",
        menu_reservas: "Reservations",
        menu_config: "Settings",
        menu_sair: "Logout",
        home_page: "Home",
        home_role: "Student",
        home_class: "Class:",
        home_room: "Room:",
        home_borrowed: "Borrowed",
        home_reservations: "Reservations",
        home_limit: "Limit",
        calendar_prev: "Previous month",
        calendar_next: "Next month",
        week_sun: "Sun",
        week_mon: "Mon",
        week_tue: "Tue",
        week_wed: "Wed",
        week_thu: "Thu",
        week_fri: "Fri",
        week_sat: "Sat",
        week_sun_short: "S",
        week_mon_short: "M",
        week_tue_short: "T",
        week_wed_short: "W",
        week_thu_short: "T",
        week_fri_short: "F",
        week_sat_short: "S",
        modal_title: "Confirm",
        modal_cancel: "Cancel",
        modal_confirm: "Confirm",

        calendar_weeks: "Weeks:",
        calendar_click: "Click on a date (Sunday is disabled). The system automatically selects a 7-day block.",
        calendar_align: "Align to Monday",
        rooms_title: "Available Rooms",
        rooms_subtitle: "Choose the rooms you want to rent for the selected period. Or skip this step to rent none.",
        equipment_title: "Equipment",
        equipment_subtitle: "Choose the equipment (optional). You may skip.",
        summary_title: "Reservation Summary",
        obs_label: "Notes (optional)",
        btn_back: "← Back",
        btn_next: "Next →",
        modal_reserva: "Delete reservation",
        usuario_label: "User:",
        add_user: "Add new user",
        user_photo: "User photo",
        register_user: "Register User",
        label_fullname: "Full name:",
        label_email: "Email:",
        label_ra: "Registration ID:",
        label_area: "Area:",
        label_phone: "Phone:",
        btn_register: "Register",
        btn_cancel: "Cancel",

        menu_reservas: "Reservations",
        menu_home: "Home",
        menu_usuario: "User",
        menu_config: "Settings",
        menu_sair: "Logout",
        btn_delete_reservation: "Delete reservation",
        btn_back: "to go back",
        add_equipment: "add equipment"


    }
};

// ===========================================
//  APLICAR IDIOMA NA PÁGINA
// ===========================================
function aplicarIdioma(idioma) {
    const textos = traducoes[idioma];
    if (!textos) return;

    document.querySelectorAll("[data-i18n]").forEach(el => {
        const chave = el.getAttribute("data-i18n");
        if (textos[chave]) {
            el.innerText = textos[chave];
        }
    });
}

function setIdiomaNovo(valor) {
    localStorage.setItem("idioma", valor);
    location.reload(); // Atualiza os textos
}

// ===========================================
//  TEMA GLOBAL
// ===========================================
function aplicarTema(tema) {
    if (tema === "Escuro") {
        document.documentElement.classList.add("dark-theme");
    } else {
        document.documentElement.classList.remove("dark-theme");
    }
}

function setTemaNovo(valor) {
    localStorage.setItem("tema", valor);
    aplicarTema(valor);
}

// ===========================================
//  INÍCIO DA PÁGINA (executado em TODAS páginas)
// ===========================================
document.addEventListener("DOMContentLoaded", () => {

    // --- TEMA ---
    const temaSalvo = localStorage.getItem("tema") || "Claro";
    aplicarTema(temaSalvo);

    const selectTema = document.getElementById("tema");
    if (selectTema) selectTema.value = temaSalvo;

    // --- IDIOMA ---
    const idiomaSalvo = localStorage.getItem("idioma") || "pt";
    aplicarIdioma(idiomaSalvo);

    const selectIdioma = document.getElementById("idioma");
    if (selectIdioma) selectIdioma.value = idiomaSalvo;
});
