
export const UserHistory =`
          My user wants to add their product to eCommerce platforms like Amazon, Myntra, Flipkart, etc. Please generate relevant information in JSON format about the product such as title, categories, features, color, description (not more than 200 words), based on provided data (e.g., video recognition data, transcription data, image-to-text data).
          
          Example Input Data:
          - Video Recognition Data: Categories: Name: Person, Confidence: 99.89%, Instances: BoundingBox: Height: 0.92
          - Transcription Data: "Your morning's bright. Alexa, switch on the geezers. Alexa, play romantic songs on the speaker. Alexa, start yoga mode."
          - Text-to-Image Data: {image description data}
          
          Please generate a structured JSON output for the product.
          `;
export const ModelHistory =`{
            "title": "Smart Fitness Watch with Alexa",
            "brand": "Boat",
            "categories": ["Smartwatches", "Fitness Trackers", "Wearable Technology"],
            "features": [
              "Voice control with Alexa",
              "Fitness tracking (heart rate, steps, calories burned)",
              "Smart notifications",
              "Customizable watch faces and straps",
              "Long-lasting battery life",
              "Water resistance"
            ],
            "aboutThisItem": [
              "Experience the future of fitness with our cutting-edge smartwatch.",
              "Seamlessly control your day with voice commands, track your workouts, and stay connected with smart notifications.",
              "From yoga sessions to calorie tracking, this smartwatch is your ultimate fitness companion.",
              "Customize your watch face and strap to match your style.",
              "Enjoy long-lasting battery life, so you can stay connected and active all day long."
            ],
            "description": "Experience the future of fitness with our cutting-edge smartwatch. Seamlessly control your day with voice commands, track your workouts with precision, and stay connected with essential notifications. Whether you're a yoga enthusiast or a fitness fanatic, this smartwatch is your perfect workout partner.",
            "color": ["Black", "Silver", "Rose Gold"],
            "price": "$199.99"
          }`;