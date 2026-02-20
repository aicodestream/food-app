// Indian Restaurant Menu Data
const menuData = {
    starters: [
        { id: 101, name: "Veg Spring Roll", nameMr: "वेज स्प्रिंग रोल", price: 129, description: "Crispy rolls with mixed vegetables", descriptionMr: "मिश्र भाज्यांसह कुरकुरीत रोल", image: "🥢" },
        { id: 102, name: "Chicken Wings", nameMr: "चिकन विंग्स", price: 249, description: "Spicy fried chicken wings", descriptionMr: "मसालेदार तळलेले चिकन विंग्स", image: "🍗" },
        { id: 103, name: "Paneer Pakoda", nameMr: "पनीर पकोडा", price: 149, description: "Deep fried cottage cheese fritters", descriptionMr: "तळलेले पनीर पकोडे", image: "🧀" },
        { id: 104, name: "Veg Manchurian", nameMr: "वेज मंचुरियन", price: 169, description: "Indo-Chinese vegetable balls in sauce", descriptionMr: "सॉसमध्ये भाजीचे गोळे", image: "🥘" },
        { id: 105, name: "Chicken Lollipop", nameMr: "चिकन लॉलीपॉप", price: 279, description: "Spicy chicken drumsticks", descriptionMr: "मसालेदार चिकन ड्रमस्टिक", image: "🍗" },
        { id: 106, name: "Hara Bhara Kabab", nameMr: "हरा भरा कबाब", price: 139, description: "Green vegetable patties", descriptionMr: "हिरव्या भाज्यांचे पॅटीज", image: "🥬" }
    ],
    appetizers: [
        { id: 1, name: "Paneer Tikka", nameMr: "पनीर टिक्का", price: 249, description: "Grilled cottage cheese with spices", descriptionMr: "मसाल्यांसह ग्रील्ड पनीर", image: "🧀" },
        { id: 2, name: "Samosa (2 pcs)", nameMr: "समोसा (२ पीस)", price: 49, description: "Crispy pastry with potato filling", descriptionMr: "बटाट्याची भरलेली कुरकुरीत पेस्ट्री", image: "🥟" },
        { id: 3, name: "Chicken 65", nameMr: "चिकन ६५", price: 299, description: "Spicy fried chicken appetizer", descriptionMr: "मसालेदार तळलेले चिकन", image: "🍗" }
    ],
    "main-courses": [
        { id: 4, name: "Chicken Thali", nameMr: "चिकन थाळी", price: 349, description: "Complete meal with chicken curry, rice, roti, dal, and sides", descriptionMr: "चिकन करी, भात, रोटी, डाळ आणि भाजी सह संपूर्ण जेवण", image: "images/chicken-thali.jfif" },
        { id: 5, name: "Mutton Thali", nameMr: "मटण थाळी", price: 449, description: "Complete meal with mutton curry, rice, roti, dal, and sides", descriptionMr: "मटण करी, भात, रोटी, डाळ आणि भाजी सह संपूर्ण जेवण", image: "images/mutton-thalli.jfif" },
        { id: 6, name: "Veg Thali", nameMr: "वेज थाळी", price: 249, description: "Complete vegetarian meal with curry, rice, roti, dal, and sides", descriptionMr: "भाजी, भात, रोटी, डाळ सह संपूर्ण शाकाहारी जेवण", image: "🍛" },
        { id: 7, name: "Chicken Biryani", nameMr: "चिकन बिर्याणी", price: 299, description: "Aromatic basmati rice with spiced chicken", descriptionMr: "मसालेदार चिकन सह सुगंधी बासमती तांदूळ", image: "🍚" },
        { id: 8, name: "Jeera Rice", nameMr: "जिरे भात", price: 149, description: "Cumin flavored basmati rice", descriptionMr: "जिरे चवीचे बासमती तांदूळ", image: "images/jira-rice.jfif" },
        { id: 9, name: "Butter Chicken", nameMr: "बटर चिकन", price: 329, description: "Creamy tomato-based chicken curry", descriptionMr: "मलईदार टोमॅटो बेस चिकन करी", image: "🍛" },
        { id: 10, name: "Dal Makhani", nameMr: "दाल मखनी", price: 199, description: "Creamy black lentils with butter", descriptionMr: "लोणीसह मलईदार काळी डाळ", image: "🍲" }
    ],
    desserts: [
        { id: 11, name: "Gulab Jamun (3 pcs)", nameMr: "गुलाब जामुन (३ पीस)", price: 99, description: "Sweet milk dumplings in sugar syrup", descriptionMr: "साखरेच्या पाकात गोड दुधाचे गोळे", image: "🍡" },
        { id: 12, name: "Rasgulla (3 pcs)", nameMr: "रसगुल्ला (३ पीस)", price: 99, description: "Soft cottage cheese balls in syrup", descriptionMr: "पाकात मऊ पनीर गोळे", image: "🍡" },
        { id: 13, name: "Kulfi", nameMr: "कुल्फी", price: 79, description: "Traditional Indian ice cream", descriptionMr: "पारंपारिक भारतीय आईस्क्रीम", image: "🍨" }
    ],
    beverages: [
        { id: 14, name: "Sweet Lassi", nameMr: "गोड लस्सी", price: 79, description: "Chilled yogurt drink", descriptionMr: "थंड दह्याचे पेय", image: "🥛" },
        { id: 15, name: "Masala Chai", nameMr: "मसाला चहा", price: 39, description: "Spiced Indian tea", descriptionMr: "मसालेदार भारतीय चहा", image: "☕" },
        { id: 16, name: "Fresh Lime Soda", nameMr: "ताजा लिंबू सोडा", price: 49, description: "Refreshing lime drink", descriptionMr: "ताजेतवाने लिंबू पेय", image: "🍋" }
    ]
};

