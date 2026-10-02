# Photographs for the meter panel

The explainer's sticky meter shows one photograph per reading. Until a file
exists, the exhibit shows a designed fallback ("Photograph to come"), never a
broken image. Add the files below with exactly these names. Landscape 4:3,
at least 1600 × 1200 px, JPEG, under about 500 KB each.

| File | What it should show |
|---|---|
| `electricity.jpg` | A straight-down-the-aisle view of GPU server racks in a working data center; status LEDs and thick power cabling visible; cool, even light; no people. |
| `heat.jpg` | A thermal (infrared) image of a server rack or its hot aisle with the colour-scale legend visible. Without a thermal camera: the back of a rack with large exhaust fans. |
| `water.jpg` | Evaporative cooling towers or rooftop cooling units of a data center, ideally with visible vapour against the sky. |
| `carbon.jpg` | Transmission pylons and lines leading to a power station, ideally with a fossil plant and wind turbines or solar panels in view, to suggest the grid mix. |
| `money.jpg` | Close-up of a printed utility bill or till receipt with itemised lines, beside an electricity meter or calculator; warm natural light. |
| `scale.jpg` | Aerial or drone photo of a large data center campus: several warehouse-sized buildings, rooftop cooling and the substation; daylight. |

The photos are listed in `public/index.html`: search for **PHOTOGRAPHS**.
Each reading has one line like this:

```html
<img class="step-photo" data-step="water" src="images/water.jpg"
     data-caption="Cooling towers" alt="Cooling towers on the roof of a data center…">
```

Change `src` to your file, and update `alt` (what the photo shows, for
screen readers) and `data-caption` (the line shown under the photo). Keep
`class` and `data-step` as they are. Until a file exists, a plain placeholder
with the reading's name is shown, never a broken image.
