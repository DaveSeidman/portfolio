export const projectsTemplate = `
{{#projects}}
  <div class='projects-project'>
    <div class='projects-project-header'>
      <span class='nobreak'>
        <h1 class='projects-project-header-name'>{{name}}</h1>
        <button class='projects-project-header-close'>×</button>
      </span>
      <h2 class='projects-project-header-title'>{{title}}</h2>
      <div class='projects-project-header-tags'>
        {{#tags}}<span class="projects-project-header-tags-tag {{.}}"><span class="projects-project-header-tags-tag-tip">{{.}}</span></span>{{/tags}}
      </div>
    </div>
    <div class='projects-project-body'>
      {{{desc}}}
    </div>
  </div>
{{/projects}}
`;
