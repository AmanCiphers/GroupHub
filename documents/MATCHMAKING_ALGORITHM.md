# Matchmaking Algorithm

The AI Fit score is a weighted composite of five dimensions. Each dimension contributes a portion of the final 0–100 score.

## Score Breakdown

| Dimension | Weight | Max Points | Source |
|---|---|---|---|
| Skills overlap | 35% | 35 | User skills vs project skills |
| Interest × category | 20% | 20 | User interests vs project category |
| Availability fit | 20% | 20 | User hrs/week vs project hrs/week |
| Experience × stage | 10% | 10 | User experience level vs project stage |
| Reputation | 15% | 15 | User reputation points (capped at 100) |

## Dimension Calculations

### Skills Overlap (35 pts)

```
overlap = matching_skills / total_project_skills
score   = overlap × 35
```

Case-insensitive comparison. If the project has no skills listed, contribution is 0.

### Interest × Category (20 pts)

```
score = 20 if any user interest matches project category (case-insensitive)
        0 otherwise
```

Binary match — either the user has expressed interest in the category or not.

### Availability Fit (20 pts)

```
diff  = abs(user_hours - project_hours)
fit   = max(0, 1 - diff / 80)
score = fit × 20
```

Penalizes mismatch proportionally. A 10-hour gap loses ~12.5% of this component.

### Experience × Stage (10 pts)

```
beginner:     idea=5  research=4  prototype=3  mvp=2  active=1  completed=1  paused=2
intermediate: idea=3  research=4  prototype=5  mvp=4  active=3  completed=2  paused=3
advanced:     idea=1  research=2  prototype=3  mvp=4  active=5  completed=4  paused=3
expert:       idea=1  research=1  prototype=2  mvp=3  active=5  completed=5  paused=2

score = (map_value / 5) × 10
```

A beginner working on an idea-stage project scores 10/10 for this component. An expert on the same project scores 2/10.

### Reputation (15 pts)

```
reputation = min(user_reputation / 100, 1)
score      = reputation × 15
```

Linear up to 100 reputation points, then capped.

## Final Score

```
raw = skills + interest + availability + expFit + reputation
score = Math.round(raw)
```

Rounded to the nearest integer. Scores of 0 or below are filtered out.

## Exclusions

Projects the user already owns or is a member of are excluded from recommendations.

## Endpoints

- `GET /api/v1/matchmaking/projects?limit=N` — Scores up to `N` projects for the authenticated user
- `GET /api/v1/matchmaking/members/:projectId?limit=N` — Scores up to `N` users for a project
