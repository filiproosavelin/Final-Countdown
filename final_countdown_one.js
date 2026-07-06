    let countdownInterval;

    function calculateTimeLeft() {
        // Hämta alla värden från formuläret
        let birthdateInput = document.getElementById('birthdate').value;
        if (birthdateInput.length === 6 && !birthdateInput.includes('-')) {
        const yearPart = birthdateInput.substring(0, 2);
        const monthPart = birthdateInput.substring(2, 4);
        const dayPart = birthdateInput.substring(4, 6);
        birthdateInput = `${yearPart}-${monthPart}-${dayPart}`;
    }       
        const gender = document.getElementById('gender').value;
        const height = parseFloat(document.getElementById('height').value);
        const weight = parseFloat(document.getElementById('weight').value);
        const smoking = document.getElementById('smoking').value;
        const exercise = parseInt(document.getElementById('exercise').value);
        const alcohol = document.getElementById('alcohol').value;
        const sleep = document.getElementById('sleep').value;
        const stress = document.getElementById('stress').value;
        const plantBased = document.getElementById('plant_based').value;
        const cardio = document.getElementById('cardio').value;
        const water = document.getElementById('water').value;

        // Enkel validering så att appen inte kraschar om man glömmer något
        if (!birthdateInput || !height || !weight) {
            alert("Vänligen fyll i födelsedatum, längd och vikt.");
            return;
        }

        // 1. Sätt baslivslängd utifrån SCB-statistik
        let expectedLifeYears = (gender === 'female') ? 84.8 : 81.5;

        // 2. Beräkna BMI (Vikt i kg / (Längd i meter * Längd i meter))
        const heightInMeters = height / 100;
        const bmi = weight / (heightInMeters * heightInMeters);
        
        let bmiModifier = 0;
        if (bmi >= 30 && bmi < 35) {
            bmiModifier = -3; // Fetma klass 1
        } else if (bmi >= 35) {
            bmiModifier = -7; // Kraftig fetma
        } else if (bmi < 18.5) {
            bmiModifier = -1; // Undervikt
        }
        expectedLifeYears += bmiModifier;

        // 3. Justera för övriga livsstilsfaktorer
        if (smoking === 'yes') expectedLifeYears -= 10;
        
        if (exercise === 0) expectedLifeYears -= 2;
        if (exercise === 2) expectedLifeYears += 3;

        if (alcohol === 'low') expectedLifeYears += 0.5;
        if (alcohol === 'high') expectedLifeYears -= 5;

        if (sleep === 'poor') expectedLifeYears -= 2;
        if (sleep === 'excessive') expectedLifeYears -= 1;

        if (stress === 'yes') expectedLifeYears -= 3;

        // Växtbaserad kost är kopplat till lägre risk för hjärt-kärlsjukdomar
        if (plantBased === 'vegetarian') expectedLifeYears += 1;
        if (plantBased === 'vegan') expectedLifeYears += 3;
        if (plantBased === 'animal') expectedLifeYears -= 3;

        // Pulshöjande träning ger en extra bonus utöver den vanliga träningen
        if (cardio === 'yes') expectedLifeYears += 2;
        
        // Bra vätskebalans hjälper njurar och organ, dåligt drar ner lite
        if (water === 'more') expectedLifeYears += 0.5;
        if (water === 'less') expectedLifeYears -= 0.5;

        // 4. Räkna ut slutdatumet i millisekunder
        //const birthDateObj = new Date(birthdateInput);

        // 4. Räkna ut slutdatumet i millisekunder
        const dateParts = birthdateInput.split('-');
        
        // Säkerställ att användaren faktiskt skrivit i rätt format med bindestreck
        if (dateParts.length !== 3) {
            alert("Vänligen skriv datumet exakt som ÅÅ-MM-DD (t.ex. 95-09-10).");
            return;
        }

        let year = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1; // JavaScript räknar månader från 0 (Januari = 0)
        const day = parseInt(dateParts[2], 10);

        // Smart logik för att veta om det är 1900-tal eller 2000-tal:
        // Vi tittar på dagens årtal (t.ex. 26 för 2026).
        // Är årtalet man skrev in högre än så (t.ex. 95)? Då måste det vara 1900-tal (1995).
        // Är det lägre eller lika med (t.ex. 05)? Då är det 2000-tal (2005).
        const currentYear = new Date().getFullYear();
        const currentTwoDigitYear = currentYear % 100;

        if (year > currentTwoDigitYear) {
            year += 1900;
        } else {
            year += 2000;
        }

        const birthDateObj = new Date(year, month, day);

        // Säkerhetskoll om datumet blev ogiltigt (t.ex. om man skrivit bokstäver)
        if (isNaN(birthDateObj.getTime())) {
            alert("Ogiltigt datum. Kontrollera att du skrivit in siffrorna rätt.");
            return;
        }
        
        const msPerYear = 365.25 * 24 * 60 * 60 * 1000;
        const expectedLifeMs = expectedLifeYears * msPerYear;
        const expectedDeathDateMs = birthDateObj.getTime() + expectedLifeMs;

        const formSection = document.getElementById('form-section');
        const resultSection = document.getElementById('result-section');

    // 1. Lägg på animationen som tonar ut formuläret
    formSection.classList.add('animate-fade-out');

    // 2. Använd setTimeout för att vänta i 400 millisekunder (0.4 sekunder) tills ut-animationen är klar
    setTimeout(() => {
        formSection.style.display = 'none'; // Göm formuläret helt så det inte tar plats
        resultSection.style.display = 'block'; // Ta fram resultatskärmen (men den är fortfarande osynlig via CSS)
        
        // 3. Lägg på animationen som tonar in klockan
        resultSection.classList.add('animate-fade-in');
    }, 1000);

        
        document.getElementById('stats-info').innerHTML = `
            Ditt beräknade BMI är: <strong>${bmi.toFixed(1)}</strong>.<br>
            Baserat på dina val beräknas din totala livslängd bli ca <strong>${expectedLifeYears.toFixed(1)}</strong> år.
        `;

        // 6. Starta klockan
        updateCountdown(expectedDeathDateMs);
        countdownInterval = setInterval(() => {
            updateCountdown(expectedDeathDateMs);
        }, 800);
    }

    function updateCountdown(deathDateMs) {
        const nowMs = new Date().getTime();
        const msLeft = deathDateMs - nowMs;

        if (msLeft <= 0) {
            document.getElementById('hours-left').innerText = "Du lever på övertid!";
            clearInterval(countdownInterval);
            return;
        }

        const hoursLeft = Math.floor(msLeft / (1000 * 60 * 60));
        document.getElementById('hours-left').innerText = hoursLeft.toLocaleString('sv-SE');
    }
