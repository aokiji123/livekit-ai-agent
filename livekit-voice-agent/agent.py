import json
from dotenv import load_dotenv

from livekit import agents 
from livekit.agents import AgentSession, Agent, RoomInputOptions
from livekit.plugins import noise_cancellation, silero
from livekit.plugins.turn_detector.multilingual import MultilingualModel

load_dotenv(".env")


class Assistant(Agent):
    def __init__(self, instructions: str | None = None) -> None:
        default_instructions = """You are a helpful voice AI assistant.
            You eagerly assist users with their questions by providing information from your extensive knowledge.
            Your responses are concise, to the point, and without any complex formatting or punctuation including emojis, asterisks, or other symbols.
            You are curious, friendly, and have a sense of humor.
            When you first join a conversation, greet the user warmly and offer your assistance."""
        
        super().__init__(
            instructions=instructions or default_instructions,
        )


async def entrypoint(ctx: agents.JobContext):
    system_instructions = None 
    
    if ctx.job.metadata:
        try:
            metadata_dict = json.loads(ctx.job.metadata)
            custom_prompt = metadata_dict.get("prompt_instructions")
            if custom_prompt:
                system_instructions = custom_prompt
                print(f"✅ Using custom prompt instructions: {system_instructions[:100]}...")
        except (json.JSONDecodeError, AttributeError) as e:
            print(f"⚠️ Could not parse metadata, using default instructions: {e}")
    
    if not system_instructions:
        print(f"ℹ️ No custom instructions found, using default Assistant behavior")
    
    session = AgentSession(
        stt="assemblyai/universal-streaming:en",
        llm="openai/gpt-4.1-mini",
        tts="cartesia/sonic-2:9626c31c-bec5-4cca-baa8-f8ba9e84c8bc",
        vad=silero.VAD.load(),
        turn_detection=MultilingualModel(),
    )

    assistant = Assistant(instructions=system_instructions)
    
    await session.start(
        room=ctx.room,
        agent=assistant,
        room_input_options=RoomInputOptions(
            noise_cancellation=noise_cancellation.BVC(), 
        ),
    )

    await session.generate_reply()


if __name__ == "__main__":
    agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))