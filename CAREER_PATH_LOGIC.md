# Career Path Logic & Scoring Document

## Career Role Compatibility Score Formula

$$\text{CareerScore} = 0.40 \cdot \text{SkillMatch} + 0.25 \cdot \text{IndustryDemand} + 0.15 \cdot \text{CareerPref} + 0.10 \cdot \text{EduCompat} + 0.10 \cdot \text{LocCompat}$$

### Weight Breakdown
- **`SkillMatch` (40%)**: Weighted sum of student proficiencies divided by target role skill requirements.
- **`IndustryDemand` (25%)**: Average demand index of required skills for target role.
- **`CareerPref` (15%)**: Match between student preferred domain and role category.
- **`EduCompat` (10%)**: Relevance of engineering degree discipline.
- **`LocCompat` (10%)**: Geographic proximity and mobility score.

## Skill Gap Classification & Priority
- **`MATCHED`**: Current proficiency >= required proficiency.
- **`PARTIAL`**: Current proficiency > 0 but < required proficiency.
- **`MISSING`**: Current proficiency = 0.

### Priority Rules
- **`HIGH`**: Mandatory skill for role AND market demand score $\ge 50$.
- **`MEDIUM`**: Mandatory skill OR demand score $\ge 60$ OR importance weight $\ge 0.7$.
- **`LOW`**: Nice-to-have skill or lower demand.
