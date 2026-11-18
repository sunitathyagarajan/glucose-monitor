# Glucose & Glucose Sensors: A teaching module

**🌐 Website: [sunitathyagarajan.github.io/glucose-monitor](https://sunitathyagarajan.github.io/glucose-monitor/)**
(modern sensor page: [sensor.html](https://sunitathyagarajan.github.io/glucose-monitor/sensor.html))

An interactive, self-contained web module for students on sugar chemistry, glucose detection and modern glucose sensors.

## Pages

| Page | Contents |
|---|---|
| `index.html` (main module) | 1. Sugars and saccharides: classification, reducing vs. non-reducing sugars, sugar explorer and self-quiz, zoom from starch to glucose<br>2. Glucose: 3D model (open chain, α/β pyranose, fructose), Fischer projections, aldose ⇌ ketose (enediol) stepper, Haworth anomers, mutarotation simulation<br>3. Traditional tests: virtual test-tube lab (Benedict, Fehling, Tollens, Barfoed, Seliwanoff, Molisch, iodine, GOD-POD), a mystery-sugar challenge, colour keys and equations, semi-quantitative Benedict slider, identification flowchart, results matrix<br>4. Advances: an interactive timeline from c. 500 BCE to 2024, a then vs. now table, sensor generations<br>Quiz and references |
| `sensor.html` (standalone) | The modern continuous glucose monitor: signal chain, clickable cross-section of the device, three-electrode cell, animated membrane-layer simulation, GOx catalytic cycle (O₂ and mediator modes), signal vs. glucose and oxygen simulator, blood vs. ISF lag simulator, MARD calculator, time-in-range, sensor generations, device comparison, references |

## Using it

- **Offline:** double-click `index.html`. Everything is local, so no internet or CDN is needed.
- **GitHub Pages:** push the repo, then go to *Settings → Pages → Deploy from branch → `main` / root*. Students then open `https://<user>.github.io/<repo>/`.
- Works on phones and tablets, supports light and dark mode, and prints cleanly.

## Files

```
index.html            main module
sensor.html           modern sensor page
assets/css/style.css  shared styles
assets/js/common.js   theme toggle, nav highlighting, tabs
assets/js/molviewer.js  dependency-free 3D molecule viewer + PubChem coordinates
assets/js/main.js     main-page interactives
assets/js/sensor.js   sensor-page interactives
```

## Notes for instructors

- 3D coordinates are PubChem computed conformers (CIDs 107526, 79025, 64689, 5984, 439709).
- Test-tube outcomes, the membrane particle model, the current vs. glucose model and the lag model are **simplified for teaching**. They show the right trends, but their numbers are illustrative.
- Device specifications (wear time, intervals) change often. Check current manufacturer labelling before teaching specific numbers.
- Each page lists its references at the bottom. Superscript citations link to them.
