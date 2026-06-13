const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '../src/components/storefront/HomepagePage.tsx');
let content = fs.readFileSync(targetPath, 'utf8');

const injectionPoint = content.indexOf('return (\n    <div className="min-h-screen');

if (injectionPoint !== -1 && !content.includes('renderSectionWithStyles')) {
  const customRenderFn = `
  const renderSectionWithStyles = (section: any) => {
    if (section.visible === false) return null;
    const content = renderSection(section);
    if (!content) return null;

    const isMobileHidden = section.metadata?.isMobileHidden;
    const isDesktopHidden = section.metadata?.isDesktopHidden;
    const paddingTop = section.metadata?.paddingTop || '';
    const paddingBottom = section.metadata?.paddingBottom || '';
    const backgroundColor = section.metadata?.backgroundColor || '';

    let classes = [];
    if (isMobileHidden) classes.push('hidden md:block');
    if (isDesktopHidden) classes.push('md:hidden');
    if (paddingTop) classes.push(paddingTop);
    if (paddingBottom) classes.push(paddingBottom);
    if (backgroundColor && backgroundColor !== 'transparent') classes.push(backgroundColor);

    if (classes.length > 0) {
      return (
        <div key={\`styled_\${section.id}\`} className={classes.join(' ')}>
          {content}
        </div>
      );
    }
    return <div key={\`wrapper_\${section.id}\`}>{content}</div>;
  };
`;

  content = content.slice(0, injectionPoint) + customRenderFn + content.slice(injectionPoint);
  
  content = content.replace(
    /\{activeLayout\.map\(\(section\) => renderSection\(section\)\)\}/g,
    `{activeLayout.map(renderSectionWithStyles)}`
  );
  
  fs.writeFileSync(targetPath, content, 'utf8');
  console.log('Successfully added style wrapper to storefront homepage');
} else {
  console.log('No injection point found or already applied.');
}
