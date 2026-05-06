package com.example.breakloop.data

data class MicroAction(
    val id: Int,
    val text: String,
    val requiresInput: Boolean = false
)

object MicroActionsRepository {
    private val actions = listOf(
        MicroAction(1, "Write 1 line about your goal", true),
        MicroAction(2, "Do 5 pushups"),
        MicroAction(3, "Drink a glass of water"),
        MicroAction(4, "Plan next 10 minutes", true),
        MicroAction(5, "Reply to 1 pending message"),
        MicroAction(6, "Take 5 deep breaths"),
        MicroAction(7, "Stretch your neck and shoulders"),
        MicroAction(8, "Write down 3 things you are grateful for", true),
        MicroAction(9, "Do 10 squats"),
        MicroAction(10, "Read 1 page of a book"),
        MicroAction(11, "Clean a small area for 2 minutes"),
        MicroAction(12, "Review your daily to-do list"),
        MicroAction(13, "Write out your top priority for today", true),
        MicroAction(14, "Do a 2-minute plank"),
        MicroAction(15, "Drink a cup of tea or coffee mindfully"),
        MicroAction(16, "Note down a recent win", true),
        MicroAction(17, "Do 10 jumping jacks"),
        MicroAction(18, "Organize your digital desktop"),
        MicroAction(19, "Text a family member to say hi"),
        MicroAction(20, "Brainstorm one idea to improve your work", true),
        MicroAction(21, "Stand up and walk around for 1 minute"),
        MicroAction(22, "Write down what is distracting you", true),
        MicroAction(23, "Do 5 lunges on each leg"),
        MicroAction(24, "Empty your trash bin"),
        MicroAction(25, "Listen to one calming song")
    )

    fun getRandomActions(count: Int, excludeRecent: List<String>): List<MicroAction> {
        val available = actions.filter { it.text !in excludeRecent }
        return if (available.size >= count) {
            available.shuffled().take(count)
        } else {
            actions.shuffled().take(count)
        }
    }
}
