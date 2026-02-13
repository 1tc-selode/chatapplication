# CSS Variables (Custom Properties) Guide

## Összefoglaló
Az alkalmazás most központi CSS változó rendszert használ amely a `src/styles.css` fájlban van definiálva.

## Használat

### Régi módon (❌ Ne használd):
```css
.button {
  background: #667eea;
  color: white;
  border: 1px solid #e0e0e0;
}
```

### Új módon (✅ Használd ezt):
```css
.button {
  background: var(--primary-color);
  color: var(--text-white);
  border: 1px solid var(--border-light);
}
```

## Elérhető Változók

### Főszínek
- `--primary-color`: #667eea (fő lila szín)
- `--primary-dark`: #5a4fa2 (sötétebb lila)
- `--primary-light`: #a855f7 (világosabb lila)
- `--secondary-color`: #764ba2 (másodlagos lila)

### Gradiensek
- `--gradient-primary`: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
- `--gradient-primary-dark`: linear-gradient(135deg, #5a4fa2 0%, #6d3a8a 100%)
- `--gradient-admin`: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)

### Háttérszínek
- `--bg-primary`: Elsődleges háttér (fehér / sötét szürke)
- `--bg-secondary`: Másodlagos háttér (világos szürke / fekete)
- `--bg-tertiary`: Harmadlagos háttér
- `--bg-hover`: Hover állapot háttere
- `--bg-active`: Aktív elem háttere

### Szövegszínek
- `--text-primary`: Elsődleges szöveg (fekete / fehér)
- `--text-secondary`: Másodlagos szöveg
- `--text-tertiary`: Harmadlagos szöveg
- `--text-muted`: Halványított szöveg
- `--text-white`: Fehér szöveg

### Szegélyszínek
- `--border-light`: Világos szegély
- `--border-medium`: Közepes szegély
- `--border-dark`: Sötét szegély

### Státusz Színek
- `--status-online`: Zöld (online jelző)
- `--status-online-light`: Világos zöld
- `--status-offline`: Szürke (offline jelző)
- `--status-success`: Siker háttér
- `--status-success-text`: Siker szöveg
- `--status-success-border`: Siker szegély
- `--status-error`: Hiba háttér
- `--status-error-text`: Hiba szöveg
- `--status-error-border`: Hiba szegély

### Gomb Színek
- `--btn-danger`: Piros (veszély gomb)
- `--btn-danger-hover`: Sötétebb piros
- `--btn-secondary`: Szürke (másodlagos gomb)
- `--btn-secondary-hover`: Sötétebb szürke

### Árnyékok
- `--shadow-sm`: Kicsi árnyék
- `--shadow-md`: Közepes árnyék
- `--shadow-lg`: Nagy árnyék
- `--shadow-primary`: Primary szín árnyék

### Méretezés
- `--sidebar-width`: 250px
- `--user-list-width`: 200px

## Dark Mode
A dark mode automatikusan működik! Amikor a `body.dark-mode` osztály aktív, a változók automatikusan átváltanak sötét témára.

**Nem kell** külön `:host-context(body.dark-mode)` szabályokat írni ha CSS változókat használsz!

### Példa:
```css
/* Egyszerű - működik light és dark mode-ban */
.card {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-light);
}
```

## Migráció Menete

1. Nyiss meg egy komponens CSS fájlt
2. Keresd meg a hardcoded színeket (#667eea, white, #333, stb.)
3. Cseréld le őket a megfelelő CSS változóra
4. Töröld a `:host-context(body.dark-mode)` szabályokat (már nem kellenek)
5. Teszteld mind light, mind dark mode-ban

## Példa Komponens Frissítése

### Előtte (message-list.css):
```css
.message-content {
  background: white;
  color: #333;
}

:host-context(body.dark-mode) .message-content {
  background: #2a2a2a;
  color: #fff;
}
```

### Utána:
```css
.message-content {
  background: var(--bg-primary);
  color: var(--text-primary);
}
/* Dark mode automatikus! */
```

## Komponensek Státusza

### ✅ Frissítve:
- styles.css (alap változók)
- chat-layout.css (részben)
- sidebar.css (teljesen)

### ⏳ Frissítendő:
- message-list.css
- message-input.css
- user-list.css
- admin-panel.css
- login.css
- register.css

## Előnyök

1. **Központi kezelés**: Egy helyen változtatod a színeket
2. **Konzisztencia**: Minden komponens ugyanazokat a színeket használja
3. **Dark mode**: Automatikusan működik, nem kell duplikált kód
4. **Karbantartható**: Könnyebb megérteni és módosítani
5. **Teljesítmény**: Gyorsabb mint a duplikált dark mode szabályok
