export const properties = [
  {
    id: "masai-mara-bush-camp",
    name: "Masai Mara Bush Camp",
    location: "Masai Mara National Reserve, Kenya",
    description: "Experience the ultimate safari adventure in our luxury tented camp overlooking the vast plains of the Masai Mara. Witness the Great Migration and enjoy world-class game viewing.",
    type: "camp" as const,
    price: 450,
    images: [
      "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=600&fit=crop",
      "https://my.microsoftpersonalcontent.com/personal/976f00e28c6782bd/_layouts/15/download.aspx?UniqueId=f68d8c01-dc29-41e0-b798-33288659a5d1&Translate=false&tempauth=v1e.eyJzaXRlaWQiOiI3MjdkNzUwOS02MzFlLTQzODEtYTFhYS1kNjE2MDIwNzY2MTUiLCJhdWQiOiIwMDAwMDAwMy0wMDAwLTBmZjEtY2UwMC0wMDAwMDAwMDAwMDAvbXkubWljcm9zb2Z0cGVyc29uYWxjb250ZW50LmNvbUA5MTg4MDQwZC02YzY3LTRjNWItYjExMi0zNmEzMDRiNjZkYWQiLCJleHAiOiIxNzU5MTI1ODM2In0.FotROBFH5f7CS1F38rJSpEvMj82EfCAUmOdzqGHe0dI98VRWcwDv5vXnvEWD0Ba4dzB2mHlqmfipHHAQWjlwXHrPaeOSUXHFN043lLKVgIg4vAxMjMSVkpcyEJWbg6TNiPUZ9PAV7P_gnJcPpWnQfZlN24_LSQvq_NUXE8OlGaeVGrPWZaSrDuzu8kdGKNPRCfPbscOYfH1K2uJcfFwoQmACH2mq1bzoot5CnNoNp27LrGMEh7slP8pKHO1l9QaXeFWkZBFz1ar_Hey0HgheDxvjtDvt6D5PlB09LekZ7qepDun7-rh3WJk2dfjrdfAeLY7n-vtmA_tfu8ui4_pa-YiWDCPbnFfJVJ9gAfzg9MwZIfKG7PHKvlZl3uHpTmpANhg-vIJZJL02zHq7sLHdJMg3oBxP0_gSShzHI00PPXkr0p3dmROOUjv1pjqij-r7chgHqAaE9rMvxWcQEoGJ0vlcGRf-6f8tkON7_qiAndVW48MtGaM1my2127ne-uJ-JGuY9jRdqy_Xpo54B2qZZg.CGCHjSZso6oVDWa_sEyq5rPz8B6SxJjCwyEuL5MCGxc&ApiVersion=2.0",
      "https://images.unsplash.com/photo-1549366021-9f761d040a94?w=800&h=600&fit=crop"
    ],
    amenities: ["Game Drives", "Cultural Visits", "Bush Breakfast", "Sundowners", "WiFi", "All Meals Included"],
    rating: 4.9,
    reviews: 127,
    maxGuests: 8,
    featured: true,
    rooms: [
      {
        id: "luxury-tent-1",
        name: "Luxury Safari Tent",
        type: "luxury",
        price: 450,
        maxGuests: 2,
        description: "Spacious canvas tent with en-suite bathroom and private deck overlooking the savanna.",
        amenities: ["King Bed", "En-suite Bathroom", "Private Deck", "Mini Bar"],
        images: [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop"
        ]
      },
      {
        id: "family-tent-1",
        name: "Family Safari Tent",
        type: "family",
        price: 650,
        maxGuests: 4,
        description: "Large tent with separate children's area and family bathroom facilities.",
        amenities: ["2 Double Beds", "Family Bathroom", "Sitting Area", "Mini Fridge"],
        images: [
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&h=600&fit=crop"
        ]
      }
    ]
  },
  {
    id: "serengeti-luxury-lodge",
    name: "Serengeti Luxury Lodge",
    location: "Central Serengeti, Tanzania",
    description: "Perched on a rocky outcrop with panoramic views of the Serengeti plains. Our lodge offers unparalleled luxury and exclusive wildlife experiences.",
    type: "lodge" as const,
    price: 750,
    images: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1549366021-9f761d040a94?w=800&h=600&fit=crop"
    ],
    amenities: ["Infinity Pool", "Spa", "Fine Dining", "Game Drives", "Hot Air Balloon", "WiFi"],
    rating: 4.8,
    reviews: 89,
    maxGuests: 6,
    featured: true,
    rooms: [
      {
        id: "presidential-suite",
        name: "Presidential Suite",
        type: "presidential",
        price: 1200,
        maxGuests: 2,
        description: "Ultimate luxury with private butler, infinity pool, and helicopter transfers.",
        amenities: ["King Bed", "Private Pool", "Butler Service", "Helicopter Transfer"],
        images: [
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop"
        ]
      },
      {
        id: "deluxe-suite",
        name: "Deluxe Suite",
        type: "deluxe",
        price: 750,
        maxGuests: 3,
        description: "Spacious suite with panoramic views and premium amenities.",
        amenities: ["King Bed", "Panoramic Views", "Premium Minibar", "Private Deck"],
        images: [
          "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=600&fit=crop"
        ]
      }
    ]
  },
  {
    id: "ngorongoro-crater-villa",
    name: "Ngorongoro Crater Villa",
    location: "Ngorongoro Conservation Area, Tanzania",
    description: "Exclusive villa on the rim of the world's largest intact caldera. Private and intimate with breathtaking crater views.",
    type: "villa" as const,
    price: 950,
    images: [
      "https://images.unsplash.com/photo-1549366021-9f761d040a94?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&h=600&fit=crop"
    ],
    amenities: ["Private Chef", "Crater Views", "Library", "Fireplace", "Game Drives", "Cultural Tours"],
    rating: 4.9,
    reviews: 45,
    maxGuests: 4,
    featured: false,
    rooms: [
      {
        id: "crater-view-suite",
        name: "Crater View Master Suite",
        type: "master",
        price: 950,
        maxGuests: 2,
        description: "Master suite with floor-to-ceiling windows overlooking the crater.",
        amenities: ["King Bed", "Crater Views", "Fireplace", "Private Terrace"],
        images: [
          "https://images.unsplash.com/photo-1549366021-9f761d040a94?w=800&h=600&fit=crop"
        ]
      },
      {
        id: "garden-suite",
        name: "Garden Suite",
        type: "standard",
        price: 750,
        maxGuests: 2,
        description: "Cozy suite with garden views and easy access to common areas.",
        amenities: ["Queen Bed", "Garden Views", "Sitting Area", "Mini Bar"],
        images: [
          "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&h=600&fit=crop"
        ]
      }
    ]
  }
];