# Header for a block of text describing a taxon
ABOUT-taxon-header = ABOUT

Add-Date-Time = Add Date/Time

Add-Location = Add Location

Add-optional-notes = Add optional notes

Add-to-projects = Add to projects

Amphibians = Amphibians

Arachnids = Arachnids

Birds = Birds

Cancel = Cancel

Captive-Cultivated = Captive/Cultivated

# Quality grade option
Casual = Casual

Combine-Photos = Combine Photos

# Onboarding for users learning to group photos in the camera roll
Combine-photos-onboarding = Combine photos into observations – make sure there is only one species per observation

CREATE-AN-OBSERVATION = CREATE AN OBSERVATION

Evidence = Evidence

Explore = Explore

Filters = Filters

Finish = Finish

Fish = Fish

Fungi = Fungi

Geoprivacy = Geoprivacy:

Group-Photos = Group Photos

Has-Photos = Has Photos

Has-Sounds = Has Sounds

IDENTIFICATION = IDENTIFICATION

Identification = Identification

Insects = Insects

Introduced = Introduced

Location = Location

Mammals = Mammals

Media = Media

Mollusks = Mollusks

Native = Native

# Quality grade option
Needs-ID = Needs ID

New-Observation = New Observation

Next = Next

No-Location = No Location

Obscured = Obscured

Observation = Observation

Open = Open

Other-Data = Other Data

Paused = Paused

Plants = Plants

# Help text for playing back a sound recording
Playing-Sound = Playing Sound

# Help text for beginning a sound recording
Press-Record-to-Start = Press Record to Start

Private = Private

Projects = Projects

Quality-Grade = Quality Grade

Record-a-sound = Record a sound

Record-new-sound = Record new sound

Recording-Sound = Recording Sound

Remove-Photos = Remove Photos

Reptiles = Reptiles

# Quality grade option
Research-Grade = Research Grade

Reset = Reset

Search-for-a-location = Search for a location

Search-for-a-project = Search for a project

Search-for-a-taxon = Search for a taxon

Search-for-a-user = Search for a user

Select = Select

Separate-Photos = Separate Photos

# Header for a section showing taxa similar to a single taxon
SIMILAR-SPECIES-header = SIMILAR SPECIES

Sort-by = Sort by

Status = Status

# Header for a block of text describing a taxon's conservation status
STATUS-header = STATUS

# Header in pop up explaining options for creating an observation
STEP-1-EVIDENCE = STEP 1. EVIDENCE

Submit-without-evidence = Submit without evidence

Take-a-photo-with-your-camera = Take a photo with your camera

Tap-to-search-for-taxa = Tap to search for taxa

Taxon = Taxon

# Header for a block of text describing a taxon's taxonomy
TAXONOMY-header = TAXONOMY

# Onboarding for users adding their first evidence of an organism
The-first-thing-you-need-is-evidence = The first thing you need is evidence of an organism. This helps others identify what you saw.

Threatened = Threatened

Upload-a-photo-from-your-gallery = Upload a photo from your gallery

UPLOAD-OBSERVATION = UPLOAD OBSERVATION

# Shows the number of photos a user selected from the camera roll for upload
Upload-X-photos = Upload {$count ->
    [one] 1 photo
    *[other] {$count} photos
}

User = User

Visually-search-iNaturalist-data = Visually search iNaturalist’s wealth of data. Search by a taxon in a location

# Banner above Explore Map showing total number of results
X-Observations = {$observationCount ->
    [one] 1 Observation
    *[other] {$observationCount} Observations
}

# Displays number of photos and observations a user has selected from the camera roll
X-photos-X-observations = {$photoCount ->
    [one] 1 photo
    *[other] {$photoCount} photos
}, {$observationCount ->
    [one] 1 observation
    *[other] {$observationCount} observations
}