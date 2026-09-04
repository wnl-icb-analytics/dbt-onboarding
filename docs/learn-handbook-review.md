# Review of the /learn handbook

Reviewed on 4 September 2026 against onboarding commit `a229a95`.

The revisions below have now been applied. The handbook has 14 lessons, including new chapters on analytical tables and on building and checking a change. Dataset catalogues and operational details have moved to reference pages. The original review is retained here to explain the editorial decisions; its page counts and observations describe the starting version.

## Recommendation

Keep the handbook as substantial educational reading. Rebalance it by giving each page a distinct teaching purpose, explaining foundations earlier and replacing repeated arguments with worked examples.

The main problem is not that the pages are long. Several pages spend time establishing the same argument: shared definitions prevent repeated source preparation, models need clear contracts, and products should compose reusable models. Meanwhile, readers meet grain, facts, dimensions and temporal relationships before they have enough concrete examples to understand them.

The most valuable change is to redistribute the teaching. Some pages should become shorter, but the introductory modelling material needs more explanation, especially small tables that show what SQL does to rows.

This review covers all 12 lessons in `LEARN`, the `/learn` index and the `/learn/layer-cake` redirect. It also examines the principal modelling diagrams, model-finding exercise, layer definitions and lesson navigation. It is a source-based editorial review, not a browser usability study or verification of the current analytics repository, clinical definitions or governance policy. Existing reading times are labels, not measured learner timings.

## What to preserve

- Real analytical questions and recognisable local datasets. These give the conventions a reason to exist.
- The distinction between source preparation, shared meaning and a product's requirements.
- Join fan-out, population and time, missing evidence, and explainable results. These are central teaching, not optional refinements.
- The explanation that tests search for counterexamples and cannot establish an unstated requirement.
- Git as a record of decisions, including why staging, review and small coherent changes help.
- Production failures as changes in what people can trust, including stale descendants and partial runs.
- Worked examples and exercises. Improve their progression and consistency rather than replacing them with rule lists.

## Page-by-page decisions

### /learn

Keep the routes for different needs and the complete sequence. The beginner route currently says to read Why dbt? and then take Understanding dbt, while the page also offers a straight handbook sequence. Explain whether those are alternative ways to learn or whether both are expected.

State the actual prerequisite: readers have written SQL, but need not know dbt, Git or dimensional modelling. Explain that they can read without installing anything. Divide the sequence into learning sessions with sensible stopping points. The present lesson labels total 168 minutes before allowing for practice or rereading; that should not look like one sitting.

Add a visible contents list to long lessons. The shared lesson shell currently adds links to headings but does not provide a within-page contents list. Useful navigation supports long reading without turning the chapter into a reference sheet.

### 1. Why dbt? · /learn/why-dbt

Keep the familiar SQL-script problems, the small model, the compiled SQL and the explanation of where dbt sits. This is an effective concrete introduction.

Combine "Where the speed comes from" and "What changes for you". Both return to benefits already established. Reduce the lifecycle section to a short orientation that points forward. Keep the comparison with building the workflow ourselves as optional deeper reading; it is useful rationale, but readers should understand a model first.

Replace "You already write good SQL" with an invitation that fits the audience. Explain SELECT, a saved model file and the resulting table or view without assuming the reader already distinguishes those things. Define compilation in plain language before introducing DDL. Leave the detailed explanation of how references resolve to The DAG.

The reader should leave able to explain what dbt does with a SQL file and why the team uses it.

### 2. Analysts and dbt · /learn/analysts-and-dbt

Keep this as a separate, relatively short chapter. It answers a real onboarding question: what can I contribute, and when do I need another person's judgement?

The opening, "Analysts can work across the analytical system" and the closing section repeatedly establish that analysts can contribute beyond dashboards. Retain one clear argument and use the space for one concrete shared change: the analyst clarifies the question, a domain owner agrees its meaning and an engineer helps where platform behaviour is involved.

Keep the authority table and the boundaries around specialist decisions. Remove the early dynamic-table and target-lag digression. Those implementation choices do not help explain participation at this point. Replace broad claims about rigid hand-offs with the specific decisions the example requires.

### 3. The data we model · /learn/the-data

This needs the largest reduction in catalogue material. It currently combines source orientation, a model directory, naming instruction, discovery advice, temporal modelling and product governance.

Keep the two source families, what their records represent, the distinction between patient records and people, and the identifier bridge. Bring the identifier explanation forward from its current position after the large catalogues. Explain "person spine" as the table that provides the starting list of people, rather than assuming the term is familiar.

"What the project creates", the OLIDS search table and "Use the taxonomy to find a more specific model" repeat many of the same model families. Retain a few representative outputs. Move the detailed source folders, model counts and family catalogues to a separate dataset reference page. Leave the clinical interpretation and provenance needed to use those outputs in the lesson.

Add a small, explicitly fictional linkage example showing someone with several patient records and someone without a cross-dataset identifier. Explain what is retained or lost when joining. This teaches more than another list of model names.

Keep a brief orientation to current and historical data; defer the full modelling explanation. Let Finding models own the discovery method and Data layers own the reporting/published boundary. Retain the reminder that a product's approved purpose matters, with one agreed source for the detailed governance wording.

### 4. Data layers · /learn/data-layers

Keep this as a long chapter. The waiting-list journey and the distinction between a transformation's purpose and its SQL syntax are worth the space.

Each layer currently has an italic contract, explanatory prose and a promise callout. Keep a short opening definition and the explanation that develops it. Remove the closing callout where it merely repeats the opening. The final "Why the separation pays" also largely repeats the introduction and layer descriptions.

Keep one complete waiting-list journey and the sorting exercise. Explain the simplest staging example first. Move the SLAM submission example, unusual staging joins and difficult boundary cases into a clearly labelled deeper section after the main journey. Link to project configuration for detailed folder-to-schema routing, while retaining enough folder context to orient the reader.

Show a few input and output rows at the grain-changing step. The current early staging example introduces `qualify`, a window function and an unresolved key placeholder before those mechanisms are taught. Readers should be able to understand the layer decision without deciphering that SQL.

Leave facts and dimensions to the earlier foundations chapter and detailed model-boundary decisions to Designing models. Keep brief reminders here because the layer journey must still make sense when read independently.

### 5. The DAG · /learn/refs-and-sources

This is already reasonably bounded. Keep `ref()`, `source()`, dependency direction and the same model resolving to different environments.

Lead with the problem of dependencies, rather than "Never hardcode a table". Introduce the name as "How models depend on each other", then explain DAG. Show two small connected models before expanding to the larger project diagram. Explain the template braces, upstream and downstream next to that example.

Move this lesson before Data layers so readers understand the references in the layer examples. Remove "Environment setup gave you..." because setup is not a prerequisite in the current learning sequence.

Teach the local raw-only `source()` convention once. The legacy-remediation paragraph and reviewer callout repeat it; keep the convention and link to the source practice guide for migration steps. Leave detailed CI deferral to From merge to production. Keep one selector example as an application of the graph, not a new command-reference section.

### 6. The model taxonomy · /learn/model-naming

Keep name decomposition, prefixes, meaningful suffixes and the warning that a name is not a full description of behaviour. Consider the clearer title "Reading model names".

"Families make the project searchable" and "Read a family sideways" cover much the same ground. Retain one family comparison that shows a useful difference. Detailed search methods belong in Finding models; instructions for choosing a new name can live here too, with Designing models linking back after the design decision.

Move the substantial fact/dimension explanation into foundations, leaving a short reminder here. A reader cannot learn dimensional modelling from a prefix table.

Change the exercise so it distinguishes finding a candidate from establishing that the candidate fits. In particular, its ethnicity question currently discourages `dim_person_demographics` even while acknowledging it would work. Either accept that answer or explicitly ask for the model that owns the ethnicity definition. The present wording conflicts with the advice to use convenient wide marts.

### 7. Finding and reusing models · /learn/finding-models

Keep contract inspection, lineage, evidence and the choice to reuse, compose, extend or create. This is a distinct skill and deserves its own chapter.

Condense "A mature project changes where analysis begins" and remove the repeated concluding argument in "Discovery is how the project compounds". The reader has already met that case in Why dbt?, The data we model and Data layers.

Organise the chapter around one search carried through to a decision. It currently opens with diabetes and blood pressure, then switches to an asthma dashboard. Choose one scenario. Show the candidates, why a plausible candidate is unsuitable, the description and test evidence, and the resulting gap.

Provide a visible editor or catalogue route before command-line searches. Do not require knowledge of `rg`, regular expressions or selectors to understand discovery. Use a short annotated description first; the complete YAML-writing lesson comes later.

Teach how to assess an existing model here. Designing models should begin with the remaining gap, without repeating this search or the full case for reuse.

### 8. Designing models · /learn/model-design

This has the most important material and the greatest concentration of separate topics. Split its foundational teaching from its later design judgement.

Move the first explanation of grain, keys, join multiplicity and facts/dimensions into an earlier chapter, provisionally "Understanding analytical tables". Use the appointment example before the register example. Teach current versus historical context briefly there; keep the harder temporal decisions in Designing models.

Then make Designing models about how to turn a real missing requirement into useful models. Keep its discussion of independent reasons to change, convenient wide marts, temporal correctness, scoped programme rules, unknown values and retained evidence.

Compress "Model the domain, not the first question", which repeatedly re-establishes the benefits of reusable definitions. Consolidate "Define once, then compose for use", "Useful boundaries make reuse possible" and "Stable shared models let products vary" around one worked design. Preserve both sides of the judgement: a giant model hides responsibilities, but a separate model for every expression creates needless work.

Use the asthma scenario to demonstrate a decision the discovery chapter has not already made. Show what an initial design gets wrong, where a boundary changes, and what a later request can now reuse. Add a small counterexample where a local calculation should stay in the existing model. This makes the argument concrete and avoids implying that newcomers must design a complete domain before delivering anything.

Move "Keep expensive steps small" to later SQL/performance guidance. Move naming mechanics to Reading model names. Preserve the tests link, without reteaching how to write assertions.

### 9. Tests & documentation · /learn/tests-and-docs

Keep this substantial. Its explanation of a test as a query for failing records is one of the clearest teaching passages in the handbook.

"A test is an assertion, not an inspection" and "Tests turn assumptions into executable evidence" explain the same mechanism. Teach it once, then develop one example from a row-level promise through YAML, failing rows and a corrected result.

Combine the overlapping arguments in "A model is reusable when its promise is visible" and "Documentation makes the project discoverable". Keep the practical explanation of writing descriptions that record decisions. Turn the late clinical-register example into the example used throughout, rather than a further prose recap.

Retain composite uniqueness, relationship-population mismatches, null meaning and the limits of passing tests. These are essential explanations, not details to cut. Show why a relationship check and a uniqueness check protect different assumptions.

Introduce YAML gently before presenting the complete block. Keep unit tests as an optional extension. Move the generator command to the existing YAML practice guide. Keep the explanation that a failed test does not roll back a built table, then link to Observing production for investigation.

### 10. Git & pull requests · /learn/git-and-prs

Keep the explanation of local versus remote history, branches, staging, commits and PRs. SQL experience does not imply familiarity with any of these.

Use one edited model and its YAML to illustrate the states: edited, staged, committed locally, pushed and merged. Explain that Git staging is unrelated to the project's staging data layer. Show the resulting state after each step rather than presenting a long command sequence and explaining it afterwards.

Combine repeated material about history preserving decisions, readable commits, small PRs and the diff. The late worked example should demonstrate review changing the proposal, not restate the chapter's argument.

Keep human review, proportional evidence and the public-repository data boundary. Move exact workflow triggers and merge-queue mechanics to From merge to production. Link to the existing Git course and PR practice guides for command execution and recovery. Keep enough commands to explain the concepts; removing all commands would make the lesson abstract.

Explicitly distinguish merging code from successfully updating warehouse data. The next chapter can then explain the hand-off without restarting Git.

### 11. From merge to production · /learn/merge-to-production

Keep this chapter, but change its centre from workflow inventory to the journey of one change. Readers first need to understand compilation, validation, deployment and later data refresh.

Start with that journey and the question each step answers. Then map the steps to the project's workflows. Define a workflow, runner, target, manifest and merge queue when they become necessary. The current opening asks readers to absorb filenames and selectors before explaining the overall sequence.

Keep the distinction between deploying changed code and refreshing unchanged code with new data. Keep a short explanation of development destinations and permissions. Leave the detailed reference-resolution lesson to The DAG.

Move exact schedule tables, concurrency configuration, fallback behaviour, failed-manifest publication and skip-deploy controls to an operational reference or clearly labelled operator section. These details deserve a maintained home, but most authors do not need to memorise them to understand deployment.

Keep author responsibilities and a brief description of failure reporting. Move the investigation sequence to Observing production. Follow the selected model through to a production result so the reader sees what "merged" does and does not establish.

### 12. Observing production · /learn/observing-production

Keep the distinction between a green run and a healthy project, the investigation sequence, stale outputs and confirming recovery. This is useful education for analysts as well as engineers.

Shorten the lifecycle recap. Move the Elementary table inventory and the full app-page inventory to operator reference material. Introduce Elementary in a sentence, then show how a reader uses the evidence.

Carry one illustrative failure through the chapter: a model builds, its grain test fails, selected descendants are skipped, and a later unrelated green run does not establish recovery. Show the status, relevant times and the next decision at each step. Include an example of a successful build with old source data so readers distinguish execution success from freshness.

Keep a brief reminder that passing tests do not establish every analytical requirement. The full argument belongs in Tests & documentation. End with evidence of resolution and who needs to act. Add an interpretation exercise; this lesson currently has neither a quiz nor an interactive investigation.

### /learn/layer-cake

This is a redirect to Data layers, not a duplicate lesson. Preserve it for existing links.

## Where repeated explanations should live

| Repeated subject | Main teaching home | Useful treatment elsewhere |
| --- | --- | --- |
| Why shared definitions save work | Why dbt? | Apply the idea to the current example, without repeating the full argument |
| Source families and identifiers | The data we model | Brief identifier reminders beside joins |
| Grain, keys, join multiplicity, fact/dimension basics | New foundations chapter | Recall the principle and examine a more demanding case |
| Layer responsibilities and reporting versus published | Data layers | Apply the distinction to discovery or design |
| Name grammar and choosing a name | Reading model names | Use real names; link back for naming mechanics |
| Finding and evaluating existing models | Finding models | Start later examples with what discovery established |
| Model boundaries, scope and useful width | Designing models | Brief context in layers and naming |
| Recording and testing a model's promises | Tests & documentation | Explain what the evidence means for the current task |
| Why review is needed and who decides | Git & pull requests | Short reminders where a domain or operational decision arises |
| Targets resolving references | The DAG | Production explains how workflows use them |
| Deployment and scheduling | From merge to production | One lifecycle signpost elsewhere |
| Failure investigation and recovery | Observing production | Tests explains failure behaviour; deployment links to investigation |

A reminder is useful when it adds a new consequence or gives the reader a chance to recall something. Repeating the same conclusion in a paragraph, a callout and a checklist adds length without that benefit. Keep brief local explanations for readers who arrive directly at a page; do not make understanding depend on repeatedly following links away.

## A better sequence

1. Why dbt?
2. Analysts and dbt
3. The data we model, reduced to orientation and linkage
4. Understanding analytical tables, extracted and expanded from Designing models
5. How models depend on each other, currently The DAG
6. Data layers
7. Reading model names
8. Finding and reusing models
9. Designing models
10. Tests & documentation
11. Git & pull requests
12. From merge to production
13. Observing production

This adds one chapter but removes the need for later pages to teach foundations repeatedly or assume them. Keep the participation chapter early so beginners know the material is intended for them.

Foundations should use a small fictional appointment dataset. Show what one row means, which key identifies it, how a join can repeat it, and how grouping changes the question. Introduce facts and descriptive dimensions through those rows. A simple explanation of missing matches and current versus historical attributes prepares readers for the deeper design chapter.

Do not add a general SQL course as a prerequisite. Explain the SQL operation needed for the example at the point of use. In particular, introduce grouping and one-to-many joins before window functions or `qualify`.

## Consistency repairs to make alongside the edit

These are concrete conflicts or misleading examples in the reviewed material. They should be resolved before polishing the prose.

- **Tests are not presented consistently.** Tests & documentation repeatedly describes assertions running on every build and in PR CI. From merge to production says PR updates compile and runtime validation happens in the merge queue. Align the wording with the described workflow and distinguish model execution from the command that also runs tests.
- **The introductory safety claims are too absolute.** Why dbt? says rebuilding is "always safe" and describes models universally as `create or replace`. The DAG says development is "safe by construction". Later chapters explicitly discuss failed tests leaving new relations in place and grants providing the permission boundary. Use the later, qualified explanation consistently. Scope the introductory model definition to the SQL models being taught.
- **Governance wording conflicts.** The data page says controls must not be inferred from a broad source family. Data layers makes a blanket statement that commissioning datasets do not need the opt-out filter. Reconcile the wording against the project's approved guidance; an editorial review cannot choose the correct policy.
- **The reference example changes underneath its explanation.** The DAG shows a waiting-list/specialty join but then says the model depends on `stg_csds_bridging`. Explain the references actually present in that example.
- **The waiting-list example calls a maximum date complete.** Data layers names a CTE `latest_complete_snapshot`, but its shown SQL only selects a maximum date. Either explicitly state that completeness is an upstream guarantee or use an example that demonstrates the completeness decision. A name alone does not teach that distinction.
- **The waiting-list examples do not keep names and identifiers consistent.** Data layers uses `stg_wl_openpathways_data`; The DAG uses `stg_wl_wl_openpathways_data`. Testing examples use `person_id` for `int_wl_current`, while the layer example uses `sk_patient_id`. Verify the real names and columns or label a consistent fictional example throughout.
- **The discovery exercise rewards a narrower model without sufficient reason.** The ethnicity task rejects a valid wide demographics candidate. Align the exercise with its stated analytical question and the mart guidance.
- **Interactive copy also needs the same review.** The layer diagram's shared description assigns "shared domain meaning" to modelling more categorically than the prose, which explains that reporting facts can complete a definition. The fan-out exercise says every downstream count is wrong; teach the specific count that becomes wrong instead of making a universal claim.

Use source references when checking these: `why-dbt/page.tsx`, `refs-and-sources/page.tsx`, `data-layers/page.tsx`, `the-data/page.tsx`, `tests-and-docs/page.tsx`, `merge-to-production/page.tsx`, `components/ModelFinder.tsx`, `components/GrainFanout.tsx` and `lib/layers.ts`. Lesson paths are beneath `app/(handbook)/learn/`.

## Suggested editing order and checks

First establish the chapter boundaries and the foundations lesson. Then edit The data we model, Data layers, Reading model names, Finding models and Designing models as one connected group. These contain the largest overlaps, so editing them independently risks moving repetition around.

Next revise Tests & documentation and the delivery/production chapters. Finish with the introduction, participation chapter, index, reading times and shared exercises so their promises match the revised journey.

For each chapter, check that a reader can answer its central question, follow an example from input to outcome and explain why a plausible alternative is unsuitable. Preserve explanation that makes a decision understandable. Remove paragraphs whose only contribution is to repeat a benefit already established.

Keep essential reasoning in the main text. Use optional sections for second examples and specialist exceptions, and separate reference pages for catalogues, schedules and configuration details. Avoid hiding the main explanation inside collapsed panels.

After rewriting, check lesson links, heading links, navigation order and exercise feedback together. Existing courses may refer to these pages and anchors. Test all illustrative SQL and commands at the level their labels promise, and distinguish real project examples from fictional ones. Re-estimate reading times using the finished prose plus time to interpret diagrams and exercises, then try a chapter with an analyst new to dbt. Do not impose a uniform word limit or promise a reduction percentage before that work.
