<details><summary><h1>Caffeinated Lions (Team #3)</h1></summary>

Eliora Browning, Terri Crawford, Rylie McDonald, Michael Painter, Robert Russell
Last Updated: 4/12/26
![Team 3's logo for Caffeinated Lions: A portrait drawing of a green lion with coffee beans in its mane.](.\Selu383.SP26.Web\src\styles\assets\ConceptLogo2.png)
[This README will be more verbose/formal once the opposite ends of the code are closer to being fully connected.]

<details><summary><h2>What is this?</h2></summary>

- Full-stack coffee shop app project for CMPS 3830 (Spring 2026).
- API in ASP.NET Core.
- Web frontend in React + Vite.
- Mobile frontend in Expo + React Native.
- Tests in MSTest.
</details>

<details><summary><h2>Prereqs:</h2></summary>
- .NET 10 SDK
- Node.js + npm
- LocalDB (or update connection string in appsettings.json)
</details>

### Terminal commands you can run from the root folder to start things with a press of the enter button:

- #### Run API:
  `cd Selu383.SP26.Api; dotnet watch`
- #### Run Web:
  `cd Selu383.SP26.Web; npm install; npm run dev`
- #### Run Mobile:
  `cd Selu383.SP26.Mobile; npm install; npm run start`
- #### Run Tests
  `cd Selu383.SP26.Tests; dotnet test`
  </details>

<details><summary><h1> Where are the files that do things?</h1></summary>

<details>
<summary><h2> Selu383.SP26.Api </h2></summary>

- **appsettings.json**
- **appsettings.Development.json**
- **Program.cs**

  ### **Controllers** → logic for Features
  - **AuthenticationController.cs**
  - **LocationsController.cs**
  - **LoyaltyController.cs**
  - **MenuController.cs**
  - **OrdersController.cs**
  - **PaymentsController.cs**
  - **ReservationsController.cs**
  - **StripeWebhookController.cs**
  - **TablesController.cs**
  - **UsersController.cs**

  ### **Data** → DB config and data seeding
  - **DataContext.cs**
  - **SeedHelper.cs**

  ### **Features** is where what Controllers... control are defined

  </details>

<details><summary><h2> Selu383.SP26.Web </h2></summary>

- **vite.config.ts** → Vite config (build and proxy server settings)

  ### **src** → the mother of all folders

  (...or at least the ones that matter right now...)
  - #### **api** → API client code
    - ##### context-providers
      - **app-context.tsx:** This is still a bit dense, but there's still good logic in there from the Figma build that I'm trying to reorganize, condense, and actually apply when I can
      - **user-context.tsx:** Might not need to exist because app-context might already have it covered, but I made this based on class notes, and haven't gotten to it yet
    - **dto-interfaces.ts:** I haven't separated these by entity, since we don't have enough of those that it causes any problems yet
    - **menu.ts:** part of an AI code shuffle that made things work, but I'm now cleaning up
    - **orders.ts:** like menu.ts: AI code that works but is inefficiently messy
  - #### **components** → reusable UI elements
    Each of these has a .tsx and most of them have a .css
    - background-art
    - cancel
    - dialog
    - dialogs
    - footer
    - icons
    - image-with-fallback
    - loyalty-card
    - success
  - #### **hooks** → custom hooks
    - **useApiReadOrDelete.tsx:** A react hook that should both perform GET and DELETE requests from the front end. I know that the get all works, as well as the authentication, but I haven't tested delete yet
    - **useApiWrite.tsx:** A react hook for POST and PUT. I know POST works, but haven't updated anything yet.
  - #### **navigation** → r
    - navbar.css: navbar styling
    - navbar.tsx: This is technically a component, but I put it here to try to keep things organized.
    - router.tsx: replaced the tab system with the routing system the TAs know
      -router.ts: the actual route list
  - #### **pages** → routed pages
    Each of these is a folder with a .tsx and accompanying .css
    - cart
    - dashboard (the landing page)
    - login (actually holds auth.tsx and .css, but I can't decide between names)
    - menu (orders take place here for now, but it should be just for browsing)
    - orders (had copilot make this from parts of other files, still placeholders)
    - reservations
    - user (contains profile.tsx and .css, since I couldn't decide on a name)
  - #### styles → still a mess, but less so than before
    - Assets (folder for pictures, I was scrolling back and forth so much that I moved it into styles for now, at least)
    - fonts.css (tiny style file for fonts. Part of tailwind.css, which I'm still trying to figure out, but at low priority compared to wiring up features at the moment)
    - index.css (imported by index.html from the Selu383.SP26.Web folder as part of what I believe is tailwind related: makes sure theme.css and friends apply throughout the app)
    - theme.css (global theme file: has some bloat, still, but used to be over 2000 lines, so I'll take it)
    - tokens.ts: Halfway optimized from the Figma version, the color tokenization that used to take place here is now in theme.css. I'm still working my way through the rest of what's left in there

</details>

<details><summary><h2> Selu383.SP26.Mobile </h2></summary>
(This is not my area of development right now, so I'll keep it vague. - Eliora)

### **app** → tab routes (Expo Router)

### **components** → reusable mobile components

### **contexts** for login and cart

### **services** → API calls

### **hooks** → custom theme and API hooks

### **assets** → static/theme files

</details>
</details>
