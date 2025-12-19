// Test script to debug project creation
const payload = {
  "project": {
    "name": "West Test",
    "client_name": "West",
    "slug": "west-test"
  },
  "presentationConfig": {
    "font_family": "Inter",
    "font_size": 24,
    "text_color": "#15598a",
    "outline_color": "#000000",
    "background_color": "#e0ecf6",
    "transition_duration": 5,
    "animation_style": "fade",
    "layout_template": "standard"
  }
};

fetch('http://localhost:3000/api/projects', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Cookie': process.argv[2] || '' // Pass session cookie as argument
  },
  body: JSON.stringify(payload)
})
.then(res => res.json())
.then(data => console.log('Response:', JSON.stringify(data, null, 2)))
.catch(err => console.error('Error:', err));
