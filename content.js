/* =====================================================================
   ReviewRanger content file
   =====================================================================

   THIS IS THE ONLY FILE YOU NEED TO EDIT TO ADD PUZZLES.

   You do not need to be a programmer. You are filling in a form made of
   text. Keep the shape (the brackets, the commas, the words in quotes)
   and change the words inside the quotes.

   Quick rules for a good puzzle (the README has the friendly long version):

   1.  Every puzzle has a `promise` (one plain sentence, what the code is
       meant to do) and a `snippet` (the lines of code, as a list).
   2.  `findings` is the list of problems hidden in the snippet. A puzzle
       can have one finding, several, or none at all (an "already correct"
       puzzle is allowed and welcome).
   3.  Every finding needs four things: a `summary`, a `why`, a `rule`,
       and a `fix`. Plain English. Short sentences. No idioms.
   4.  Every finding's `lines` must be real line numbers in its snippet.
       The first line of a snippet is line 1.
   5.  Write your own snippets. Never copy code from a real project or a
       website. Make something small and made-up, like the examples below.
   6.  Anything between the quote marks ` ` is yours to change. The words
       outside the quotes (like `promise:` or `snippet:`) must stay.

   To add a puzzle: copy one whole `{ ... }` block (from the `{` to the
   matching `},`), paste it next to the others inside the right theme's
   `puzzles: [ ... ]` list, and edit the text. Save, commit, done.

   The schemaVersion below lets future versions of the app understand
   older content files. Leave it as it is unless told otherwise.
   ===================================================================== */

export const content = {
  schemaVersion: 1,

  /* The attribution line, shown in the app and required by the content
     licence (CC BY-SA 4.0). Keep it, add yourself to "and contributors". */
  attribution: "ReviewRanger by YouCantBearMe and contributors.",

  /* -------------------------------------------------------------------
     The mentor's voice.
     These are the warm, never-graded words shown after each puzzle.
     Change the tone if you like, but keep it kind. There is no "wrong"
     anywhere in here, and there must never be.
     ------------------------------------------------------------------- */
  voice: {
    // Shown when the learner found every finding and added no stray flags.
    allCaught:
      "There it is. You read the promise, checked the code against it, and caught it. That is code review, and you just did it.",
    // Shown when the learner found at least one finding but not all.
    some: "Nice, you caught part of this. Let me show you the rest.",
    // Shown when the learner found none of the findings.
    none: "Good, you took a real look, that is the part that counts. Let me walk you to it.",
    // Shown on a puzzle that has no findings, when the learner flagged nothing.
    clean:
      "Nothing here breaks the promise, and you saw that. Knowing when code is fine is a real part of review too.",
    // Small badge on a finding the learner flagged.
    spotted: "you spotted this",
    // Small badge on a finding the learner missed.
    toNotice: "here is the one to notice",
    // Shown when the learner flagged a line that was actually doing its job.
    stray:
      "About the line you flagged: it is doing its job fine here. No harm at all, a careful eye that lands a little wide is still a careful eye, and that is what review needs.",
    // Always shown last. The whole point of the app.
    close:
      "You saw real things in real code just now. There is a place for you in this.",
  },

  /* -------------------------------------------------------------------
     The glossary.
     Every symbol on the left gets a plain-English meaning on the right.
     When a snippet uses one of these symbols, the learner can tap it to
     read the meaning. If you use a new symbol in a snippet, add it here
     so it can be tapped and explained.
     ------------------------------------------------------------------- */
  glossary: {
    "def": "defines a function, a named block of steps",
    "return": "hands this value back to whoever called the function",
    "if": "do the next part only when this is true",
    "else": "do this other part when the if was not true",
    "==": "is the same as",
    "!=": "is not the same as",
    ">": "is greater than",
    "<": "is less than",
    ">=": "is greater than or equal to",
    "<=": "is less than or equal to",
    "=": "puts the value on the right into the name on the left",
    "+": "adds two things together",
    "-": "subtracts the right value from the left value",
    "*": "multiplies two numbers",
    "/": "divides the left number by the right number",
    "[0]": "the first item, counting starts at zero",
    "[1]": "the second item, counting starts at zero",
    "len": "how many items are in the list",
    "True": "the yes value",
    "False": "the no value",
    ".append": "adds an item to the end of the list",
    "#": "a note for people reading the code; the computer skips it",
  },

  /* -------------------------------------------------------------------
     The optional reading primer.
     A learner can read this first or skip it. Skipping is treated as
     "I already read code." Keep it short and gentle.
     ------------------------------------------------------------------- */
  primer: {
    title: "Reading code changes 101",
    intro:
      "This is optional. If you have read code before, skip it. If not, it is three short ideas, and then you are ready.",
    sections: [
      {
        heading: "What a line is",
        body:
          "Code is read one line at a time, from top to bottom. Each line is one small step. When you review, you look at the lines one by one and ask what each one does.",
      },
      {
        heading: "What a name or a comment promises",
        body:
          "A function's name, like cheaper_price, is a promise about what the code does. A comment, the text after a #, is a note in plain words. Both tell you what the code is supposed to do. Neither one is guaranteed to be true. Your job is to check.",
      },
      {
        heading: "What review means",
        body:
          "Reviewing code means reading it and asking one simple question: does this do what it claims? You do not have to write the code or know everything. You read the promise, you read the code, and you point at anything that does not match. That is review.",
      },
    ],
    closing:
      "There is nothing to memorize. Tap any symbol in the code to see what it means, any time.",
    skipLabel: "Skip, I already read code",
    startLabel: "Start the primer",
    doneLabel: "I am ready, let's go",
  },

  /* -------------------------------------------------------------------
     The puzzles, grouped into four themes.
     Themes are shown in this order. The first puzzle of the first theme
     is the gentle first win.

     Each theme:   { id, title, blurb, puzzles: [ ... ] }
     Each puzzle:  { id, promise, snippet: [lines], findings: [ ... ] }
     Each finding: { lines: [numbers], summary, why, rule, fix }
     An "already correct" puzzle has findings: [] and an optional
     cleanNote: { why, rule }.
     ------------------------------------------------------------------- */
  themes: [
    /* ===== THEME 1 ============================================= */
    {
      id: "intent",
      title: "Does the code do what it claims?",
      blurb: "Read the promise above the code, then find the line that breaks it.",
      puzzles: [
        {
          id: "intent-cheaper-price",
          promise: "Give the customer the cheaper of the two prices.",
          snippet: [
            "def cheaper_price(price_a, price_b):",
            "    if price_a < price_b:",
            "        return price_b",
            "    else:",
            "        return price_a",
          ],
          findings: [
            {
              lines: [3, 5],
              summary:
                "The promise asks for the cheaper price, but the code hands back the more expensive one every time.",
              why:
                "When price_a is the smaller one, line 3 returns price_b, the bigger one. In the other case, line 5 returns price_a, the bigger one. So the customer is quietly overcharged. Nothing crashes, no alarm goes off, it just keeps happening until someone reads it the way you just did.",
              rule:
                "Check the code against what it claims. A name or a comment is a promise, not a fact. Read the promise first, then look for the line that breaks it.",
              fix: "Swap the two returns: line 3 returns price_a, and line 5 returns price_b.",
            },
          ],
        },
        {
          id: "intent-with-tax",
          promise: "Add 10 percent tax to the price and return the total.",
          snippet: [
            "def with_tax(price):",
            "    return price * 0.10",
          ],
          findings: [
            {
              lines: [2],
              summary:
                "The promise asks for the price plus its tax, but the code returns only the tax.",
              why:
                "price * 0.10 is the tax on its own. The price itself is never added back in, so the customer is charged only the small tax amount and the real price disappears.",
              rule:
                "Read what the promise asks for, then check the code gives the whole thing, not just one piece of it.",
              fix: "Return price + price * 0.10, which is the price plus its tax.",
            },
          ],
        },
        {
          id: "intent-is-empty",
          promise: "Return True when the basket has no items.",
          snippet: [
            "def is_empty(basket):",
            "    return len(basket) > 0",
          ],
          findings: [
            {
              lines: [2],
              summary:
                "The promise asks for True when the basket is empty, but the code returns True when it has things in it.",
              why:
                "len(basket) > 0 is true when there is at least one item. That is the opposite of empty, so this answers backwards: a full basket looks empty and an empty basket looks full.",
              rule:
                "When a check returns yes or no, say the promise out loud and make sure the yes matches the case the promise names.",
              fix: "Use len(basket) == 0, which is true only when there are no items.",
            },
          ],
        },
        {
          id: "intent-full-name",
          promise: "Return the first and last name joined by a space.",
          snippet: [
            "def full_name(first, last):",
            "    return first + last",
          ],
          findings: [
            {
              lines: [2],
              summary:
                "The promise asks for a space between the names, but the code joins them with nothing.",
              why:
                'first + last places the two names right against each other, so "Ada" and "Lovelace" come back as "AdaLovelace". The space the promise asked for is missing.',
              rule:
                "Small joining details still count. If the promise names a separator, check that the code actually puts it in.",
              fix: 'Return first + " " + last, with a space in the middle.',
            },
          ],
        },
        {
          id: "intent-greet",
          promise: "Return a greeting that uses the person's name.",
          snippet: [
            "def greet(name):",
            '    return "Hello, friend"',
          ],
          findings: [
            {
              lines: [2],
              summary:
                "The promise says to use the person's name, but the code always says the same thing.",
              why:
                'The code returns "Hello, friend" no matter who is passed in. The name the function was given is never used, so everyone gets the same greeting.',
              rule:
                "If the promise mentions a value, check that the code actually uses it. An unused input is often a sign the promise was not kept.",
              fix: 'Return "Hello, " + name, so the greeting includes the name.',
            },
          ],
        },
        {
          id: "intent-double",
          promise: "Return the number multiplied by two.",
          snippet: [
            "def double(number):",
            "    return number * 2",
          ],
          findings: [],
          cleanNote: {
            why:
              "number * 2 is exactly the promise: take the number and multiply it by two. There is no line that breaks the promise here.",
            rule:
              "Not every snippet has a problem. Part of review is seeing when the code already keeps its promise and saying so, with no second-guessing.",
          },
        },
      ],
    },

    /* ===== THEME 2 ============================================= */
    {
      id: "edges",
      title: "The edges",
      blurb: "Bugs love boundaries. Test the exact edge value in your head.",
      puzzles: [
        {
          id: "edges-is-adult",
          promise: "Return True if the person is 18 or older.",
          snippet: [
            "def is_adult(age):",
            "    return age > 18",
          ],
          findings: [
            {
              lines: [2],
              summary:
                "The promise says 18 or older, but the code only says older than 18.",
              why:
                "With age > 18, someone who is exactly 18 is turned away even though they should be let in. The bug hides right on the edge, at the exact number the promise names.",
              rule:
                "Boundaries are where bugs live. Whenever you see a comparison, test the edge value in your head. Here, ask what happens at exactly 18.",
              fix: "Use age >= 18, which includes 18 itself.",
            },
          ],
        },
        {
          id: "edges-first-item",
          promise: "Return the first item in the list.",
          snippet: [
            "def first_item(items):",
            "    return items[1]",
          ],
          findings: [
            {
              lines: [2],
              summary:
                "The promise asks for the first item, but the code reaches for the second one.",
              why:
                "Counting starts at zero, so items[0] is the first item and items[1] is the second. This code skips the real first item.",
              rule:
                "Counting starts at zero. items[0] is first and items[1] is second, so when a position looks off by one, this is usually why.",
              fix: "Use items[0].",
            },
          ],
        },
        {
          id: "edges-has-enough",
          promise: "Return True if the balance is at least the price.",
          snippet: [
            "def has_enough(balance, price):",
            "    return balance > price",
          ],
          findings: [
            {
              lines: [2],
              summary:
                "The promise says at least the price, but the code leaves out the case where they are equal.",
              why:
                "At least the price includes the moment balance equals price. With balance > price, a person whose balance is exactly the price is told they do not have enough, even though they do.",
              rule:
                "At least and at most include the edge value. When you see those words, the comparison usually needs the equals part too.",
              fix: "Use balance >= price.",
            },
          ],
        },
        {
          id: "edges-last-item",
          promise: "Return the last item in the list.",
          snippet: [
            "def last_item(items):",
            "    return items[len(items)]",
          ],
          findings: [
            {
              lines: [2],
              summary:
                "The promise asks for the last item, but the code reaches one step past the end.",
              why:
                "Counting starts at zero, so a list of three items has positions 0, 1, and 2. The length is 3, and items[3] points just past the last real item. The last position is the length minus one.",
              rule:
                "For the last item, think length minus one, because counting starts at zero. The end of a list is a classic edge to check.",
              fix: "Use items[len(items) - 1].",
            },
          ],
        },
        {
          id: "edges-passed",
          promise: "Return True only when the score is above 70.",
          snippet: [
            "def passed(score):",
            "    return score >= 70",
          ],
          findings: [
            {
              lines: [2],
              summary:
                "The promise says above 70, but the code also lets 70 itself through.",
              why:
                "Above 70 means higher than 70, so 70 should not count. With score >= 70, a score of exactly 70 is treated as passing, one more than the promise allows.",
              rule:
                "Above and over mean the edge value does not count. Read whether the promise includes the boundary or not, then match the comparison to it.",
              fix: "Use score > 70, which leaves 70 out.",
            },
          ],
        },
        {
          id: "edges-free-shipping",
          promise: "Give free shipping when the order is 50 dollars or more.",
          snippet: [
            "def free_shipping(total):",
            "    return total > 50",
          ],
          findings: [
            {
              lines: [2],
              summary:
                "The promise says 50 or more, but the code only gives free shipping above 50.",
              why:
                "Or more includes exactly 50. With total > 50, an order of exactly 50 dollars misses out on the free shipping it was promised.",
              rule:
                "Or more and or less include the edge number. When the promise says that, the comparison usually needs the equals part.",
              fix: "Use total >= 50.",
            },
          ],
        },
      ],
    },

    /* ===== THEME 3 ============================================= */
    {
      id: "slips",
      title: "The small slips",
      blurb: "A swapped value, a wrong name, a copy-paste leftover. Small and quiet.",
      puzzles: [
        {
          id: "slips-area",
          promise: "Return the area of a rectangle, width times height.",
          snippet: [
            "def area(width, height):",
            "    return width * width",
          ],
          findings: [
            {
              lines: [2],
              summary:
                "The promise multiplies width by height, but the code multiplies width by itself.",
              why:
                "width * width uses width twice and never touches height. It looks almost right, which is exactly why this kind of slip slides past. height was meant to be the second value.",
              rule:
                "When two inputs should both appear, check that both actually do. A value used twice often means another was forgotten.",
              fix: "Return width * height.",
            },
          ],
        },
        {
          id: "slips-total-score",
          promise: "Return the sum of the two test scores.",
          snippet: [
            "def total_score(math, science):",
            "    return math + math",
          ],
          findings: [
            {
              lines: [2],
              summary:
                "The promise adds the two scores, but the code adds the math score to itself.",
              why:
                "math + math counts the math score twice and leaves science out completely. The result changes with math alone, no matter what science was.",
              rule:
                "When a function takes two inputs, make sure both show up in the answer. A repeated name is a common copy slip.",
              fix: "Return math + science.",
            },
          ],
        },
        {
          id: "slips-price-tag",
          promise: "Return the price with the dollar sign in front.",
          snippet: [
            "def price_tag(amount):",
            '    return amount + "$"',
          ],
          findings: [
            {
              lines: [2],
              summary:
                "The promise puts the dollar sign in front, but the code puts it behind.",
              why:
                'amount + "$" places the sign after the number, so 5 comes back as "5$" instead of "$5". The order is the whole point of the promise, and it is reversed.',
              rule:
                "Order matters when you join things. Read left to right and check the pieces line up the way the promise describes.",
              fix: 'Return "$" + amount, with the sign first.',
            },
          ],
        },
        {
          id: "slips-taller",
          promise: "Return the taller of height_a and height_b.",
          snippet: [
            "def taller(height_a, height_b):",
            "    if height_a > height_b:",
            "        return height_a",
            "    else:",
            "        return height_a",
          ],
          findings: [
            {
              lines: [5],
              summary:
                "The else branch still returns height_a, a leftover from the line above.",
              why:
                "Line 3 correctly returns height_a when it is taller. Line 5 was meant to return the other one, height_b, but it was copied without the change. When height_b is the taller one, it is never given back.",
              rule:
                "After a copy and paste, check the part that was supposed to change. The two branches of an if should usually differ.",
              fix: "Line 5 returns height_b.",
            },
          ],
        },
        {
          id: "slips-average",
          promise: "Return the average of two numbers.",
          snippet: [
            "def average(a, b):",
            "    return (a + b) / 3",
          ],
          findings: [
            {
              lines: [2],
              summary:
                "The promise averages two numbers, but the code divides by three.",
              why:
                "An average adds the values and divides by how many there are. There are two numbers here, so this should divide by 2. Dividing by 3 makes every answer smaller than it should be.",
              rule:
                "Check the constant numbers, not just the names. A single wrong digit changes every result quietly.",
              fix: "Divide by 2: (a + b) / 2.",
            },
          ],
        },
        {
          id: "slips-hello-order",
          promise: "Return the greeting as Hello, then first name, then last name.",
          snippet: [
            "def hello(first, last):",
            '    return "Hello, " + last + " " + first',
          ],
          findings: [
            {
              lines: [2],
              summary:
                "The promise puts the first name before the last, but the code has them the other way around.",
              why:
                'The code joins last before first, so "Ada" and "Lovelace" come back as "Hello, Lovelace Ada". Each piece is correct on its own, but two of them are swapped.',
              rule:
                "When several pieces are joined, check their order against the promise, not just that they are all present.",
              fix: 'Put first before last: "Hello, " + first + " " + last.',
            },
          ],
        },
        {
          id: "slips-two-slips",
          promise: "Return the greeting Hello, then the first name, then the last name.",
          snippet: [
            "def greeting(first, last):",
            '    name = last + " " + first',
            '    return "Hi, " + name',
          ],
          findings: [
            {
              lines: [2],
              summary: "The names are joined in the wrong order, last before first.",
              why:
                'name is built as last, then a space, then first, so "Ada" and "Lovelace" become "Lovelace Ada". The promise asks for the first name first.',
              rule:
                "When values are joined, check their order against the promise, one piece at a time.",
              fix: 'Build name as first + " " + last.',
            },
            {
              lines: [3],
              summary: "The greeting word is Hi, but the promise asks for Hello.",
              why:
                'The promise names the exact greeting, Hello. This returns "Hi, ..." instead, a small wording slip that changes what the user sees.',
              rule:
                "When the promise quotes exact words, check the code uses those same words.",
              fix: 'Start the greeting with "Hello, ".',
            },
          ],
        },
      ],
    },

    /* ===== THEME 4 ============================================= */
    {
      id: "comments",
      title: "Does the comment still match the code?",
      blurb: "A comment is a promise too. Notice when it stops matching the code.",
      puzzles: [
        {
          id: "comments-sale-price",
          promise: "Return the price after a 20 percent discount.",
          snippet: [
            "def sale_price(price):",
            "    # take 10 percent off",
            "    return price * 0.8",
          ],
          findings: [
            {
              lines: [2],
              summary:
                "The comment says 10 percent off, but the code takes 20 percent off.",
              why:
                "Multiplying by 0.8 keeps 80 percent of the price, which is a 20 percent discount, and that matches the promise. The comment still says 10 percent, left over from an earlier version. The code is right here; the comment is the one that lies.",
              rule:
                "A comment is a promise too. When the comment and the code disagree, do not assume the code is wrong. Check both against what the function should do.",
              fix: "Update the comment to say take 20 percent off.",
            },
          ],
        },
        {
          id: "comments-dashboard",
          promise: "Return True only if the user is logged in.",
          snippet: [
            "def can_see_dashboard(logged_in):",
            "    # always let everyone in",
            "    return logged_in",
          ],
          findings: [
            {
              lines: [2],
              summary:
                "The comment says everyone is let in, but the code only lets logged-in users in.",
              why:
                "Returning logged_in gives True only when the user is logged in, which is exactly the promise. The comment claims the opposite, that everyone gets in. A reader who trusts the comment would believe this code is unsafe when it is not.",
              rule:
                "A misleading comment can cost as much as a bug, because the next person acts on what it says. When it disagrees with the code, one of them needs fixing.",
              fix: "Change the comment to say let in only logged-in users.",
            },
          ],
        },
        {
          id: "comments-add-item",
          promise: "Add the item to the cart and return the cart.",
          snippet: [
            "def add_item(cart, item):",
            "    # remove the item from the cart",
            "    cart.append(item)",
            "    return cart",
          ],
          findings: [
            {
              lines: [2],
              summary: "The comment says remove, but the code adds the item.",
              why:
                "cart.append(item) puts the item onto the end of the cart, which is adding, and that is what the promise asks for. The comment says remove, the exact opposite of what the line does.",
              rule:
                "Read the comment and the line right under it as a pair. If the verb in the comment does not match the action in the code, trust the code and fix the comment.",
              fix: "Change the comment to say add the item to the cart.",
            },
          ],
        },
        {
          id: "comments-apples",
          promise: "Return the number of apples, which is 5.",
          snippet: [
            "def apples():",
            "    # there are 10 apples",
            "    count = 5",
            "    return count",
          ],
          findings: [
            {
              lines: [2],
              summary: "The comment says 10 apples, but the code uses 5.",
              why:
                "count is set to 5 and then returned, which matches the promise of 5. The comment says 10, a number that appears nowhere in the code. Someone skimming the comment would walk away with the wrong figure.",
              rule:
                "Numbers in comments go stale easily. When a comment states a value, check it against the value the code actually uses.",
              fix: "Change the comment to say there are 5 apples.",
            },
          ],
        },
        {
          id: "comments-shipping",
          promise: "Charge 3 dollars for shipping.",
          snippet: [
            "def shipping_fee():",
            "    # shipping is free",
            "    return 3",
          ],
          findings: [
            {
              lines: [2],
              summary:
                "The comment says shipping is free, but the code charges 3 dollars.",
              why:
                "The code returns 3, which is the 3 dollar charge the promise asks for. The comment says free, which would tell a reader no money changes hands. The code is correct and the comment is out of date.",
              rule:
                "When a comment and the code tell different stories, slow down and decide which matches the promise. Here it is the code, so the comment is the fix.",
              fix: "Change the comment to say shipping costs 3 dollars.",
            },
          ],
        },
        {
          id: "comments-fee",
          promise: "Return the price with a 2 dollar fee added.",
          snippet: [
            "def total_with_fee(price):",
            "    # add a 5 dollar fee",
            "    return price + 2",
          ],
          findings: [
            {
              lines: [2],
              summary: "The comment says a 5 dollar fee, but the code adds 2 dollars.",
              why:
                "price + 2 adds the 2 dollar fee the promise asks for. The comment still says 5, probably the fee from an earlier version. The code keeps the promise, so the comment is the part that is wrong.",
              rule:
                "When the promise and the code agree but the comment does not, the comment is the stale one. Update it so the next reader is not misled.",
              fix: "Change the comment to say add a 2 dollar fee.",
            },
          ],
        },
      ],
    },
  ],
};
