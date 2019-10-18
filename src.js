// Nelson Textbook Scraper
// You acknowledge to use this at your own risk, creator is not responsible for any consequences or legal repercussions
// It is your responsibility to abide by the laws of your country of residence when using this

// Run this in the console of your web browser

function makeHttpObject() {
  try {
    return new XMLHttpRequest();
  } catch (error) { }
  try {
    return new ActiveXObject("Msxml2.XMLHTTP");
  } catch (error) { }
  try {
    return new ActiveXObject("Microsoft.XMLHTTP");
  } catch (error) { }

  throw new Error("Could not create HTTP request object.");
}

function pdf_exists(url) {
  return new Promise(function (resolve) {
    try {
      let request = makeHttpObject();
      request.open("GET", url, true);
      request.send(null);

      request.onreadystatechange = function () {
        if (request.readyState == 4)
          if (request.responseText.includes("Error 404--Not Found"))
            resolve(false);
          else
            resolve(true);
      };
    } catch (error) {
      resolve(false);
    }
  });
}

function gen_url(base_url, unit, chapter, section, ending) {
  let chapter_str = String(chapter);
  chapter_str = chapter_str.padStart(2, '0');

  let url = base_url;

  if (unit) {
    url += "_u" + String(unit);
  } else {
    if (chapter)
      url += "_c" + chapter_str;
    if (section) // Don't append a section if not defined
      url += "_" + chapter + "_" + section;
  }

  if (ending)
    url += ending;

  url += ".pdf";
  return url;
}

async function download_pdf(url, validate_url, file_name) {
  if (validate_url && !await pdf_exists(url))
    return;

  console.log("Downloading " + url + " as " + file_name + ".pdf")

  let link = document.createElement('a');
  link.href = url;
  link.download = file_name + '.pdf';
  link.dispatchEvent(new MouseEvent('click'));


  // Adjust the wait time accordingly if it downloads too fast (ms)
  await new Promise(resolve => setTimeout(resolve, 100));
}

{
  const base_url = prompt(
    "Enter the url of the textbook\nFrom the beginning to first _ at the end\nExample: http://k12resources.nelson.com/science/1234567890/student/documents/attachments/chem12");

  let chapter = 1;
  let section = 1;
  let unit;

  console.log("Beginning PDF download...")


  // Textbook Open
  await download_pdf(gen_url(base_url, undefined, undefined, undefined, "_fm"), true, "contents");
  await download_pdf(gen_url(base_url, undefined, undefined, undefined, "_discover"), true, "discover");
  await download_pdf(gen_url(base_url, undefined, undefined, undefined, "_safescience"), true, "safescience");


  // Chapters
  while (await pdf_exists(gen_url(base_url, undefined, chapter, section))) {
    console.log("Downloading chapter " + chapter + "...")

    // Chapter Open
    await download_pdf(gen_url(base_url, undefined, chapter, undefined, "_open"), true, chapter + "-open");

    while (await pdf_exists(gen_url(base_url, undefined, chapter, section))) {
      await download_pdf(gen_url(base_url, undefined, chapter, section), false, chapter + "-" + section);
      section++;
    }

    // Chapter Close
    await download_pdf(gen_url(base_url, undefined, chapter, undefined, "_tech"), true, chapter + "-tech_connect");
    await download_pdf(gen_url(base_url, undefined, chapter, undefined, "_awesome"), true, chapter + "-awesome_science");
    await download_pdf(gen_url(base_url, undefined, chapter, undefined, "_works"), true, chapter + "-science_works");
    await download_pdf(gen_url(base_url, undefined, chapter, undefined, "_lookingback"), true, chapter + "-looking_back");
    await download_pdf(gen_url(base_url, undefined, chapter, undefined, "_inv"), true, chapter + "-investigation");
    await download_pdf(gen_url(base_url, undefined, chapter, undefined, "_summary"), true, chapter + "-summary");
    await download_pdf(gen_url(base_url, undefined, chapter, undefined, "_sq"), true, chapter + "-self_quiz");
    await download_pdf(gen_url(base_url, undefined, chapter, undefined, "_review"), true, chapter + "-review");

    section = 1;
    chapter++;
  }


  // Units
  if (await pdf_exists(gen_url(base_url, "1", undefined, undefined, "_open"))) {
    unit = 1;
  } else if (await pdf_exists(gen_url(base_url, "a", undefined, undefined, "_open"))) {
    unit = "a";
  }

  while (await pdf_exists(gen_url(base_url, unit, undefined, undefined, "_open"))) {
    console.log("Downloading unit " + unit + "...")

    // Unit Open
    await download_pdf(gen_url(base_url, unit, undefined, undefined, "_open"), false, "u-" + unit + "-open");

    // Unit Close
    await download_pdf(gen_url(base_url, unit, undefined, undefined, "_lookingback"), true, "u-" + unit + "-looking_back");
    await download_pdf(gen_url(base_url, unit, undefined, undefined, "_ut"), true, "u-" + unit + "-tasks");
    await download_pdf(gen_url(base_url, unit, undefined, undefined, "_sq"), true, "u-" + unit + "-self_quiz");
    await download_pdf(gen_url(base_url, unit, undefined, undefined, "_review"), true, "u-" + unit + "-review");

    if (await pdf_exists(gen_url(base_url, "1", undefined, undefined, "_open"))) {
      unit++;
    } else if (await pdf_exists(gen_url(base_url, "a", undefined, undefined, "_open"))) {
      unit = String.fromCharCode(unit.charCodeAt(0) + 1);
    }
  }


  // Appendices
  let letter;
  let appendex_index = 0;
  while (await pdf_exists(gen_url(base_url, undefined, undefined, undefined, "_app_" + (letter = String.fromCharCode(65 + appendex_index).toLowerCase())))) {
    await download_pdf(gen_url(base_url, undefined, undefined, undefined, "_app_" + letter), false, "appendix_" + letter);
    appendex_index++;
  }


  // Textbook Close
  await download_pdf(gen_url(base_url, undefined, undefined, undefined, "_periodictable"), true, "periodic_table");
  await download_pdf(gen_url(base_url, undefined, undefined, undefined, "_answers"), true, "answers");
  await download_pdf(gen_url(base_url, undefined, undefined, undefined, "_glossary"), true, "glossary");
  await download_pdf(gen_url(base_url, undefined, undefined, undefined, "_index"), true, "index");
  await download_pdf(gen_url(base_url, undefined, undefined, undefined, "_credits"), true, "credits");

  console.log("---------- PDF download complete")
}
