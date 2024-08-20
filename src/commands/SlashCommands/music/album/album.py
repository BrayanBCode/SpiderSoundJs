from discord import Interaction
from discord.app_commands import Group, command
from discord.ext.commands import GroupCog


class MyGroup(GroupCog, group_name='album', group_description='description'):
    @command()
    async def subcommand(self, interaction: Interaction):
        await interaction.response.send_message('subcommand')

    subgroup = Group(name='subgroup', description='description')

    @subgroup.command()
    async def subsubcommand(self, interaction: Interaction):
        await interaction.response.send_message('subsubcommand')


async def setup(bot):
    await bot.add_cog(MyGroup())  # this is the only time guild(s) kwarg is valid in add_cog