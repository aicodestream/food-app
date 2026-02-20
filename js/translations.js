// Language translations
const translations = {
    en: {
        // Restaurant Name
        restaurantName: "Shivtirth Wada",
        
        // Navigation
        menu: "Menu",
        myOrders: "My Orders",
        cart: "Cart",
        
        // Hero Section
        heroTitle: "Delicious Food Delivered Fast",
        heroSubtitle: "Order your favorite meals and get them delivered in 30 minutes",
        orderNow: "Order Now",
        
        // Menu Categories
        starters: "🌶️ Starters",
        mainCourses: "🍛 Main Courses",
        desserts: "🍰 Desserts",
        
        // Menu Section
        ourMenu: "Our Menu",
        addToCart: "Add to Cart",
        
        // Cart
        yourCart: "Your Cart",
        emptyCart: "Your cart is empty",
        startOrdering: "Start ordering delicious food!",
        remove: "Remove",
        total: "Total",
        checkout: "Checkout",
        
        // Checkout Form
        customerDetails: "Customer Details",
        name: "Name",
        phone: "Phone",
        address: "Delivery Address",
        placeOrder: "Place Order",
        
        // Order Confirmation
        orderConfirmed: "Order Confirmed!",
        orderId: "Order ID",
        thankYou: "Thank you for your order!",
        estimatedDelivery: "Estimated Delivery",
        ownerWillCall: "Our owner will call you shortly for confirmation",
        backToMenu: "Back to Menu",
        
        // My Orders Page
        myOrdersTitle: "My Orders",
        backToMenuBtn: "← Back to Menu",
        loadingOrders: "Loading your orders...",
        noOrders: "No orders yet",
        startOrderingFood: "Start ordering delicious food!",
        browseMenu: "Browse Menu",
        deliveryAddress: "Delivery Address",
        orderItems: "Order Items",
        
        // Order Status
        pending: "Pending",
        preparing: "Preparing",
        outForDelivery: "Out for Delivery",
        delivered: "Delivered",
        
        // Login Page
        signIn: "Sign In",
        signUp: "Sign Up",
        username: "Username",
        password: "Password",
        email: "Email",
        welcomeBack: "Welcome Back",
        createAccount: "Create Account",
        alreadyMember: "Already a member?",
        notMember: "Not a member yet?"
    },
    mr: {
        // Restaurant Name
        restaurantName: "शिवतीर्थ वडा",
        
        // Navigation
        menu: "मेनू",
        myOrders: "माझे ऑर्डर",
        cart: "कार्ट",
        
        // Hero Section
        heroTitle: "चविष्ट जेवण जलद डिलिव्हरी",
        heroSubtitle: "तुमचे आवडते जेवण ऑर्डर करा आणि ३० मिनिटांत मिळवा",
        orderNow: "आता ऑर्डर करा",
        
        // Menu Categories
        starters: "🌶️ स्टार्टर्स",
        mainCourses: "🍛 मुख्य पदार्थ",
        desserts: "🍰 मिठाई",
        
        // Menu Section
        ourMenu: "आमचा मेनू",
        addToCart: "कार्टमध्ये घाला",
        
        // Cart
        yourCart: "तुमची कार्ट",
        emptyCart: "तुमची कार्ट रिकामी आहे",
        startOrdering: "चविष्ट जेवण ऑर्डर करायला सुरुवात करा!",
        remove: "काढा",
        total: "एकूण",
        checkout: "ऑर्डर द्या",
        
        // Checkout Form
        customerDetails: "ग्राहक तपशील",
        name: "नाव",
        phone: "फोन",
        address: "डिलिव्हरी पत्ता",
        placeOrder: "ऑर्डर द्या",
        
        // Order Confirmation
        orderConfirmed: "ऑर्डर कन्फर्म झाला!",
        orderId: "ऑर्डर आयडी",
        thankYou: "तुमच्या ऑर्डरबद्दल धन्यवाद!",
        estimatedDelivery: "अंदाजे डिलिव्हरी",
        ownerWillCall: "आमचे मालक लवकरच तुम्हाला कन्फर्मेशनसाठी कॉल करतील",
        backToMenu: "मेनूवर परत जा",
        
        // My Orders Page
        myOrdersTitle: "माझे ऑर्डर",
        backToMenuBtn: "← मेनूवर परत जा",
        loadingOrders: "तुमचे ऑर्डर लोड होत आहेत...",
        noOrders: "अजून ऑर्डर नाहीत",
        startOrderingFood: "चविष्ट जेवण ऑर्डर करायला सुरुवात करा!",
        browseMenu: "मेनू पहा",
        deliveryAddress: "डिलिव्हरी पत्ता",
        orderItems: "ऑर्डर आयटम",
        
        // Order Status
        pending: "प्रलंबित",
        preparing: "तयार होत आहे",
        outForDelivery: "डिलिव्हरीसाठी निघाले",
        delivered: "डिलिव्हर झाले",
        
        // Login Page
        signIn: "साइन इन",
        signUp: "साइन अप",
        username: "वापरकर्तानाव",
        password: "पासवर्ड",
        email: "ईमेल",
        welcomeBack: "परत स्वागत आहे",
        createAccount: "खाते तयार करा",
        alreadyMember: "आधीच सदस्य आहात?",
        notMember: "अजून सदस्य नाही?"
    }
};

// Get current language from localStorage or default to English
function getCurrentLanguage() {
    return localStorage.getItem('language') || 'en';
}

// Set language
function setLanguage(lang) {
    localStorage.setItem('language', lang);
    updatePageLanguage();
}

// Update all text on the page
function updatePageLanguage() {
    const lang = getCurrentLanguage();
    const t = translations[lang];
    
    // Update all elements with data-translate attribute
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (t[key]) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = t[key];
            } else {
                element.textContent = t[key];
            }
        }
    });
    
    // Update language toggle button
    const langBtn = document.getElementById('lang-toggle');
    if (langBtn) {
        langBtn.textContent = lang === 'en' ? 'मराठी' : 'English';
    }
    
    // Re-render menu with new language
    if (typeof renderMenu === 'function') {
        renderMenu();
    }
}

// Toggle language
function toggleLanguage() {
    const currentLang = getCurrentLanguage();
    const newLang = currentLang === 'en' ? 'mr' : 'en';
    setLanguage(newLang);
}

// Initialize language on page load
document.addEventListener('DOMContentLoaded', function() {
    updatePageLanguage();
});
