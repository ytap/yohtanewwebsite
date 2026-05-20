// wip/projectbox.js
import { Box } from './box.js';

export class ProjectBox extends Box {
  constructor(projectData, spawnGridX, spawnGridY, windSpeed, windDirection, tileSize) {
    super(projectData.link, spawnGridX, spawnGridY, windSpeed, windDirection, tileSize);
    this.project = projectData;
    this.iconRes = 10; // logo res
  }

  draw() {
    const spriteWidth = this.iconRes * pixelSize;
    const spriteHeight = this.iconRes * pixelSize;
    const offsetX = floor((this.currentPos.x + (this.tileSize - spriteWidth) / 2) / pixelSize) * pixelSize;
    const offsetY = floor((this.currentPos.y + (this.tileSize - spriteHeight) / 2) / pixelSize) * pixelSize;

    noStroke();
    // if image exists, sample
    if (this.project.img) {
      let img = this.project.img;
      for (let y = 0; y < this.iconRes; y++) {
        for (let x = 0; x < this.iconRes; x++) {
          let sampleX = floor(map(x, 0, this.iconRes, 0, img.width));
          let sampleY = floor(map(y, 0, this.iconRes, 0, img.height));
          let col = img.get(sampleX, sampleY);
          
          fill(col);
          rect(offsetX + x * pixelSize, offsetY + y * pixelSize, pixelSize, pixelSize);
        }
      }
    }
  }

  // click and show data
  interact() {
    this.showDetails();
  }

  showDetails() {
    if (typeof playPororoSound === 'function') playPororoSound();

    // create ui
    let container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.top = '50%';
    container.style.left = '50%';
    container.style.transform = 'translate(-50%, -50%)';
    container.style.backgroundColor = '#fff';
    container.style.border = '8px solid #000';
    container.style.padding = '40px';
    container.style.zIndex = '1000';
    container.style.fontFamily = "'TerminalGrotesque', sans-serif";
    container.style.minWidth = '400px';
    container.style.maxWidth = '600px';
    container.style.textAlign = 'center';

    //  title
    let title = document.createElement('h2');
    title.innerText = this.project.title;
    title.style.fontSize = '36px';
    title.style.marginTop = '0';
    title.style.marginBottom = '20px';
    container.appendChild(title);

    // image
    if (this.project.coverUrl) {
      let imgElem = document.createElement('img');
      imgElem.src = this.project.coverUrl;
      imgElem.style.width = '100%';
      imgElem.style.height = 'auto';
      imgElem.style.border = '4px solid #000';
      imgElem.style.marginBottom = '20px';
      container.appendChild(imgElem);
    }

    // text
    let desc = document.createElement('p');
    desc.innerText = this.project.description;
    desc.style.fontSize = '24px';
    desc.style.marginBottom = '30px';
    container.appendChild(desc);

    // external link
    if (this.project.link) {
      let linkBtn = document.createElement('button');
      linkBtn.className = 'pixel-button'; 
      linkBtn.innerText = 'Visit Project';
      linkBtn.onclick = () => {
        if (typeof playPororoSound === 'function') playPororoSound();
        window.open(this.project.link, '_blank');
      };
      container.appendChild(linkBtn);
    }

    let notifySection = document.createElement('div');
    notifySection.style.marginTop = '30px';
    notifySection.style.paddingTop = '20px';
    notifySection.style.borderTop = '2px dashed #000'; // 区切り線

    // 「Tell me when it's updated」ボタン
    let notifyBtn = document.createElement('button');
    notifyBtn.className = 'pixel-button';
    notifyBtn.innerText = "Tell me when it's updated";
    
    // Then, email form opens...
    let emailForm = document.createElement('div');
    emailForm.style.display = 'none'; 
    emailForm.style.marginTop = '15px';

    let emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.placeholder = 'your@email.com';
    emailInput.style.padding = '10px';
    emailInput.style.fontFamily = "'TerminalGrotesque', sans-serif";
    emailInput.style.fontSize = '18px';
    emailInput.style.marginRight = '10px';
    emailInput.style.border = '2px solid #000';
    emailInput.style.outline = 'none';

    let submitBtn = document.createElement('button');
    submitBtn.className = 'pixel-button';
    submitBtn.innerText = 'Submit';

    let feedbackMsg = document.createElement('p');
    feedbackMsg.style.marginTop = '15px';
    feedbackMsg.style.fontSize = '18px';
    feedbackMsg.style.display = 'none';

    // interaction logic
    notifyBtn.onclick = () => {
      if (typeof playPororoSound === 'function') playPororoSound();
      notifyBtn.style.display = 'none'; 
      emailForm.style.display = 'block'; 
    };

    submitBtn.onclick = async () => {
      if (typeof playPororoSound === 'function') playPororoSound();
      let email = emailInput.value;
      
      // check if email
      if (email && email.includes('@')) {
        const formData = new FormData();
        formData.append('project_id', this.project.id);
        formData.append('email', email);

        try {
          // Example by gemini
          // const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
          //   method: 'POST',
          //   body: formData,
          //   headers: { 'Accept': 'application/json' }
          // });

          // ui when it works
          emailForm.style.display = 'none';
          feedbackMsg.innerText = 'Yay, thank you!';
          feedbackMsg.style.display = 'block';
        } catch (error) {
          alert('Network error. Please try again later.');
        }
      } else {
        alert('Please enter a valid email address.');
      }
    };

    // create the format
    emailForm.appendChild(emailInput);
    emailForm.appendChild(submitBtn);
    notifySection.appendChild(notifyBtn);
    notifySection.appendChild(emailForm);
    notifySection.appendChild(feedbackMsg);

    // add the notify
    container.appendChild(notifySection);
    // ------------------------------------

    // close
    let closeBtn = document.createElement('button');
    closeBtn.className = 'pixel-button';
    closeBtn.innerText = 'Close';
    closeBtn.onclick = () => {
      if (typeof playPororoSound === 'function') playPororoSound();
      document.body.removeChild(container);
    };
    container.appendChild(closeBtn);

    document.body.appendChild(container);
  }
}