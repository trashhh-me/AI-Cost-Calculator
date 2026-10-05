# Photographs for the readings

Each of the six readings (electricity, heat, water, carbon, money, scale) has
space for one photograph. Until a file exists, the exhibit shows a plain
tinted block with the reading's name, never a broken image.

The frames have different shapes on purpose. Crop to roughly these
proportions (the photo is cropped to fit anyway), JPEG, under about 500 KB:

| File | Shape | What it could show |
|---|---|---|
| `electricity.jpg` | landscape 4:3 | An aisle of GPU server racks; status lights and power cabling; no people. |
| `heat.jpg` | portrait 4:5 | A thermal image of a rack or hot aisle, or the back of a rack with large exhaust fans. |
| `water.jpg` | square | Cooling towers or rooftop cooling units, ideally with vapour against the sky. |
| `carbon.jpg` | wide 16:9 | Power lines leading to a power station, ideally with a mixed grid in view. |
| `money.jpg` | portrait 3:4 | A printed itemised bill or till receipt, close up, natural light. |
| `scale.jpg` | wide 16:9 | An aerial view of a large data center campus. |

The photos are listed in `public/index.html`: search for **PHOTOGRAPHS**.
Each reading has one line like this:

```html
<img data-step="water" src="water.jpeg"
     alt="Sunlight shining down through deep blue water."
     data-alt-ne="गहिरो नीलो पानीभित्र छिरेको घामको प्रकाश।"
     width="739" height="415">
```

Change `src` to your file, and describe what the photo shows in `alt`
(English) and `data-alt-ne` (Nepali); screen readers read the one for the
visitor's language. Set `width` and `height` to the photo's pixel size. Keep
`data-step` as it is.
