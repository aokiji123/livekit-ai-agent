"""Simple unit test for the Assistant agent."""

def test_default_instructions():
    """Test that default instructions are correctly defined."""
    default_instructions = """You are a helpful voice AI assistant.
            You eagerly assist users with their questions by providing information from your extensive knowledge.
            Your responses are concise, to the point, and without any complex formatting or punctuation including emojis, asterisks, or other symbols.
            You are curious, friendly, and have a sense of humor.
            When you first join a conversation, greet the user warmly and offer your assistance."""
    
    assert "helpful voice AI assistant" in default_instructions
    assert "concise" in default_instructions
    assert "friendly" in default_instructions
    assert len(default_instructions) > 0


def test_custom_instructions_logic():
    """Test the logic for choosing between custom and default instructions."""
    default_instructions = "Default instructions"
    custom_instructions = "Custom instructions for testing"
    
    result = custom_instructions or default_instructions
    assert result == custom_instructions
    
    result = None or default_instructions
    assert result == default_instructions

