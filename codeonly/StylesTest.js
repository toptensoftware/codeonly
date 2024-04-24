import { styles } from './Styles.js';

let input = `

// This is a comment
/* so is this */

@import url(http://mysite.com/custom.css);

@font-face
{
    font-family: 'MyWebFont';
    src: url(webfont.eot);
}


@import url('this; is a url');

selector+other,
selector>other,
selector~other,
selector||other
{
    background-color: #0088ff;
    integer: 99;
    percent: 99%;
    suffix: 99rem 99.5em .25rem;
    double-quoted-string: "this is a string";
    single-quoted-string: 'this is a string';
    escaped: 'string with \\' quote charater';
    width: calc(var(--variable-width) + 20px);
}

@charset "utf-8";
@import url(http://mysite.com/custom.css);
@namespace: url(http://mysite.com/xhtml);

main,sub
{
    background-color: red;
    .class1,.class2 
    {
        display: none;
        &:hover
        {
            backgroundColor: red;
        }
    }
}

@media screen and (min-width:48em)
{
    #title 
    {
        display: flex;
        align-items: center !important;
        gap: 10px;
        width: 25%;
    }
}

@keyframes
{
    logo-spin
    {
        from: blah;
        to: blah;
    }
}
`



console.log(styles(input));