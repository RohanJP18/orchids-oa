import chalk from 'chalk';
import gradient from 'gradient-string';

export class SuccessAnimations {
  celebrate(): void {
    console.log('\n');
    console.log('🎉'.repeat(20));
    console.log(gradient.rainbow('SUCCESS! Your database is ready! 🚀'));
    console.log('🎉'.repeat(20));
    
    // Show confetti effect
    this.showConfetti();
    
    // Show final message
    this.showFinalMessage();
  }

  private showConfetti(): void {
    const colors = ['🔴', '🟡', '🟢', '🔵', '🟣', '⚪', '🟠'];
    const positions = [10, 20, 30, 40, 50, 60, 70, 80];
    
    console.log('\n');
    
    for (let i = 0; i < 15; i++) {
      setTimeout(() => {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const position = positions[Math.floor(Math.random() * positions.length)];
        process.stdout.write(`\x1b[${position}G${color}`);
      }, i * 100);
    }
    
    // Clear confetti after animation
    setTimeout(() => {
      console.log('\n');
    }, 2000);
  }

  private showFinalMessage(): void {
    setTimeout(() => {
      console.log(chalk.green.bold('\n🌟 Congratulations! 🌟'));
      console.log(chalk.cyan('Your Spotify clone now has a powerful database backend!'));
      console.log(chalk.dim('\nWhat you can do now:'));
      console.log(chalk.dim('• Store user data and playlists'));
      console.log(chalk.dim('• Manage music libraries'));
      console.log(chalk.dim('• Handle user authentication'));
      console.log(chalk.dim('• Create search functionality'));
      console.log(chalk.dim('• Build social features'));
      
      console.log(chalk.yellow.bold('\n🚀 Ready to build the future of music! 🎵'));
      console.log(chalk.dim('Powered by Orchids Database Agent 🌺'));
      
      console.log('\n');
    }, 2500);
  }

  showProgressAnimation(): void {
    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let i = 0;
    
    const interval = setInterval(() => {
      process.stdout.write(`\r${chalk.cyan(frames[i])} Processing...`);
      i = (i + 1) % frames.length;
    }, 100);
    
    // Stop animation after 3 seconds
    setTimeout(() => {
      clearInterval(interval);
      process.stdout.write('\r');
    }, 3000);
  }

  showTypingEffect(text: string, speed: number = 50): Promise<void> {
    return new Promise((resolve) => {
      let i = 0;
      const interval = setInterval(() => {
        process.stdout.write(chalk.cyan(text[i]));
        i++;
        
        if (i >= text.length) {
          clearInterval(interval);
          console.log();
          resolve();
        }
      }, speed);
    });
  }

  showLoadingBar(duration: number = 3000): Promise<void> {
    return new Promise((resolve) => {
      const barLength = 50;
      const interval = setInterval(() => {
        const progress = Math.min(1, Date.now() / duration);
        const filledLength = Math.floor(progress * barLength);
        const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
        const percentage = Math.floor(progress * 100);
        
        process.stdout.write(`\r${chalk.blue('Loading:')} [${chalk.cyan(bar)}] ${percentage}%`);
        
        if (progress >= 1) {
          clearInterval(interval);
          process.stdout.write('\r');
          resolve();
        }
      }, 50);
    });
  }

  showMatrixEffect(): void {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()';
    const lines = 10;
    
    for (let i = 0; i < lines; i++) {
      setTimeout(() => {
        const line = Array.from({ length: 40 }, () => 
          characters[Math.floor(Math.random() * characters.length)]
        ).join('');
        console.log(chalk.green(line));
      }, i * 200);
    }
    
    setTimeout(() => {
      console.log('\n');
    }, lines * 200 + 500);
  }

  showFireworks(): void {
    const fireworks = ['✨', '💫', '⭐', '🌟', '💥', '🔥', '🎆', '🎇'];
    const positions = [10, 20, 30, 40, 50, 60, 70, 80];
    
    console.log('\n');
    
    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        const firework = fireworks[Math.floor(Math.random() * fireworks.length)];
        const position = positions[Math.floor(Math.random() * positions.length)];
        process.stdout.write(`\x1b[${position}G${firework}`);
      }, i * 150);
    }
    
    setTimeout(() => {
      console.log('\n');
    }, 3000);
  }

  showOrchidsLogo(): void {
    const logo = `
    🌺  🌺  🌺  🌺  🌺
   🌺🌺🌺🌺🌺🌺🌺🌺🌺🌺
  🌺🌺🌺🌺🌺🌺🌺🌺🌺🌺🌺
 🌺🌺🌺🌺🌺🌺🌺🌺🌺🌺🌺🌺
🌺🌺🌺🌺🌺🌺🌺🌺🌺🌺🌺🌺🌺
 🌺🌺🌺🌺🌺🌺🌺🌺🌺🌺🌺🌺
  🌺🌺🌺🌺🌺🌺🌺🌺🌺🌺🌺
   🌺🌺🌺🌺🌺🌺🌺🌺🌺🌺
    🌺  🌺  🌺  🌺  🌺
    `;
    
    console.log(gradient.pastel(logo));
  }

  showCompletionSequence(): Promise<void> {
    return new Promise(async (resolve) => {
      console.log(chalk.blue.bold('\n🎯 Finalizing your database setup...'));
      
      await this.showLoadingBar(2000);
      
      console.log(chalk.green.bold('✓ Database schema created'));
      await this.showTypingEffect('✓ API endpoints generated', 30);
      await this.showTypingEffect('✓ Frontend integration complete', 30);
      await this.showTypingEffect('✓ Migrations ready', 30);
      
      this.showOrchidsLogo();
      
      setTimeout(() => {
        this.celebrate();
        resolve();
      }, 1000);
    });
  }
} 