import chalk from 'chalk';
import boxen from 'boxen';
import gradient from 'gradient-string';
import figlet from 'figlet';

export const showBanner = () => {
  // Clear the terminal
  console.clear();
  
  // Create the main banner text
  const banner = figlet.textSync('ORCHIDS DB', { 
    font: 'ANSI Shadow',
    horizontalLayout: 'default',
    verticalLayout: 'default'
  });
  
  // Apply gradient to the banner
  const gradientBanner = gradient.pastel.multiline(banner);
  
  // Create subtitle
  const subtitle = gradient.rainbow('🌺 Database Agent for Next.js Projects');
  
  // Create version info
  const version = chalk.dim('v1.0.0 • Powered by AI');
  
  // Create the full banner
  const fullBanner = boxen(
    gradientBanner + '\n' + subtitle + '\n' + version,
    {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'cyan',
      backgroundColor: 'black'
    }
  );
  
  // Display the banner
  console.log(fullBanner);
  
  // Add some spacing
  console.log('\n');
  
  // Show welcome message
  const welcomeMessage = boxen(
    chalk.blue.bold('🎯 Welcome to the most advanced database agent!') + '\n' +
    chalk.dim('Ready to transform your Next.js project with intelligent database features.'),
    {
      padding: 1,
      margin: 1,
      borderStyle: 'single',
      borderColor: 'blue',
      backgroundColor: 'black'
    }
  );
  
  console.log(welcomeMessage);
  console.log('\n');
}; 