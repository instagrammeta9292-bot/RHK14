document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const createAccountBtn = document.getElementById('createAccountBtn');

    // Handle Login Form Submission
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent page refresh

        const usernameInput = document.getElementById('username').value;
        const passwordInput = document.getElementById('password').value;

        // Placeholder logic for future backend integration
        console.log('Login attempt submitted:');
        console.log('Username:', usernameInput);
        console.log('Password:', passwordInput);

        alert(`Login button clicked! Username: ${usernameInput}`);
        
        // TODO: Add fetch() or AJAX call here later to authenticate with backend
    });

    // Handle Create New Account Button Click
    createAccountBtn.addEventListener('click', () => {
        // Placeholder logic for routing/redirecting to registration page
        console.log('Redirecting to account creation page...');
        
        alert('Create New Account button clicked!');
        
        // TODO: Add redirection logic here later, e.g., window.location.href = 'register.html';
    });
});
