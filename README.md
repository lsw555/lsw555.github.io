# Personal Portfolio Website

A clean, modern portfolio website to showcase your work, skills, and projects.

## Getting Started

### 1. Customize Your Content

#### Update Personal Information
Edit `index.html` and replace the following:
- **Your Name**: Replace all instances of "Your Name" with your actual name
- **Tagline**: Change "Web Developer | Designer | Creative Thinker" to describe yourself
- **About Me**: Update the about section with your story
- **Projects**: Replace the project titles, descriptions, and links with your actual projects
- **Skills**: Update the skills section with your actual skills
- **Contact Info**: Update email, GitHub, and LinkedIn links with your information

#### Add Your Photos

Place your images in the `images/` folder:
- `profile.jpg` - Your profile photo (recommended: 500x500px, square)
- `project1.jpg` - Screenshot or image of your first project (recommended: 800x600px)
- `project2.jpg` - Screenshot or image of your second project
- `project3.jpg` - Screenshot or image of your third project

**Tip**: Use descriptive filenames and keep images under 500KB for faster loading.

### 2. Customize Colors and Styling

Edit `style.css` to change:
- **Primary gradient**: Look for `linear-gradient(135deg, #667eea 0%, #764ba2 100%)` and replace with your colors
- **Highlight color**: Change `#ffd700` (gold) to your preferred accent color
- **Fonts**: Modify the `font-family` property to use different fonts

### 3. Deploy to GitHub Pages

#### Step 1: Create a GitHub Repository
```bash
# Make sure you're in the personal-portfolio directory
cd personal-portfolio

# Add all files to git
git add .

# Create your first commit
git commit -m "Initial portfolio website"

# Create a new repository on GitHub (visit github.com)
# Then connect your local repo to GitHub:
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
git branch -M main
git push -u origin main
```

#### Step 2: Enable GitHub Pages
1. Go to your repository on GitHub
2. Click on **Settings**
3. Scroll down to **Pages** section (in the left sidebar)
4. Under **Source**, select **main** branch
5. Click **Save**
6. Your site will be published at: `https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/`

**Note**: It may take a few minutes for your site to go live.

### 4. Update Your Portfolio

Whenever you want to update your portfolio:

```bash
# Edit your files (index.html, style.css, add new images, etc.)

# Add changes
git add .

# Commit changes
git commit -m "Update portfolio content"

# Push to GitHub
git push
```

Your website will automatically update within a few minutes!

## Project Structure

```
personal-portfolio/
├── index.html          # Main HTML file
├── style.css           # Styling
├── images/            # Your photos and project images
│   ├── profile.jpg
│   ├── project1.jpg
│   ├── project2.jpg
│   └── project3.jpg
└── README.md          # This file
```

## Tips for Success

1. **Keep it updated**: Regularly add new projects and update your skills
2. **Optimize images**: Compress images before uploading to keep site fast
3. **Be authentic**: Let your personality shine through your content
4. **Test responsiveness**: Check how your site looks on mobile devices
5. **Proofread**: Check for typos and broken links

## Need Help?

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [HTML/CSS Resources](https://developer.mozilla.org/en-US/docs/Web)

## License

Feel free to use this template for your personal portfolio!
