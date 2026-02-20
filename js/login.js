// Animation toggle
const sign_in_btn = document.querySelector("#sign-in-btn");
const sign_up_btn = document.querySelector("#sign-up-btn");
const container = document.querySelector(".container");

sign_up_btn.addEventListener("click", () => {
    container.classList.add("sign-up-mode");
});

sign_in_btn.addEventListener("click", () => {
    container.classList.remove("sign-up-mode");
});

// Login form handler
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const response = await fetch('https://api.aicodestreams.com/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Store user data
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Show success message
            alert(`Welcome back, ${data.user.name}!`);
            
            // Redirect based on role
            if (data.user.role === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'index.html';
            }
        } else {
            alert(data.message || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please try again.');
    }
});

// Signup form handler
document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('signup-username').value;
    const name = document.getElementById('signup-name').value;
    const phone = document.getElementById('signup-phone').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    
    try {
        const response = await fetch('https://api.aicodestreams.com/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password, name, phone, email })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Registration successful! Please login.');
            container.classList.remove("sign-up-mode");
            
            // Clear form
            document.getElementById('signup-form').reset();
        } else {
            alert(data.error || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed. Please try again.');
    }
});
