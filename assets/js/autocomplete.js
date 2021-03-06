import {emojis, md} from './md';
import {regexpEscape} from './util';

export const commands = [];
export const maxNumMatches = 20;

export function autocomplete(category, params) {
  return autocomplete[category] ? autocomplete[category](params) : [];
}

export function fillIn(middle, params) {
  if (middle && middle.hasOwnProperty('val')) middle = middle.val; // Autocomplete option

  const cursorPos = params.append ? params.value.length : params.cursorPos;
  let [before, after] = [params.value.substring(0, cursorPos), params.value.substring(cursorPos)];
  if (typeof middle == 'undefined') return {before, middle: '', after};

  if (params.append) {
    before = before.replace(/[ ]$/, '');
    if (before.length) middle = ' ' + middle;
  }

  if (params.padBefore) {
    before = before.replace(/[ ]$/, '');
    if (before.length) middle = ' ' + middle;
  }

  if (params.padAfter) {
    after = after.replace(/^[ ]/, '');
    middle = middle + ' ';
  }

  if (params.replace) {
    before = before.replace(/\S*\s?$/, '');
  }

  return {before, middle, after};
}

export function calculateAutocompleteOptions(str, splitValueAt, {conversation, user}) {
  let key = '';
  let afterKey = '';

  const before = str.substring(0, splitValueAt).replace(/(\S)(\S*)$/, (a, b, c) => {
    key = b;
    afterKey = c;
    return '';
  });

  const autocompleteCategory =
      key == ':' && afterKey.length ? 'emojis'
    : key == '/' && !before.length  ? 'commands'
    : key == '@' && afterKey.length ? 'nicks'
    : key == '#' || key == '&'      ? 'conversations'
    :                                 'none';

  const opts = autocomplete(autocompleteCategory, {conversation, query: key + afterKey, user});
  if (opts.length) opts.unshift({autocompleteCategory, val: key + afterKey});
  return opts;
}

autocomplete.commands = ({query}) => {
  const opts = [];

  for (let i = 0; i < commands.length; i++) {
    if (commands[i].cmd.indexOf(query) != 0) continue;
    const val = commands[i].alias || commands[i].cmd;
    const text = commands[i].example.replace(/</g, '&lt;');
    opts.push({text, val});
  }

  return opts;
};

autocomplete.conversations = ({conversation, query, user}) => {
  const connection = user.findConversation({connection_id: conversation.connection_id});
  const conversations = connection ? connection.conversations.toArray() : user.conversations();
  const opts = [];

  for (let i = 0; i < conversations.length; i++) {
    if (conversations[i].name.toLowerCase().indexOf(query) == -1) continue;
    opts.push({text: conversations[i].name, val: conversations[i].conversation_id});
    if (opts.length >= maxNumMatches) break;
  }

  return opts;
};

autocomplete.emojis = ({query}) => {
  const opts = [];

  [':', '_'].map(p => p + query.slice(1, 2)).forEach(group => {
    const emojiList = emojis(group, 'group');
    for (let i = 0; i < emojiList.length; i++) {
      if (emojiList[i].shortname.indexOf(query) >= 0) opts.push({val: emojiList[i].emoji, text: md(emojiList[i].emoji)});
      if (opts.length >= maxNumMatches) break;
    }
  });

  return opts;
};

autocomplete.nicks = ({conversation, query}) => {
  const re = new RegExp('^' + regexpEscape(query.slice(1)), 'i');
  const opts = [];

  for (let participant of conversation.participants.toArray()) {
    if (opts.length >= maxNumMatches) break;
    if (participant.nick.match(re)) opts.push({val: participant.nick});
  }

  return opts;
};

commands.push({cmd: '/me', example: '/me <msg>', description: 'Send message as an action.'});
commands.push({cmd: '/say', example: '/say <msg>', description: 'Used when you want to send a message starting with "/".'});
commands.push({cmd: '/topic', example: '/topic or /topic <new topic>', description: 'Show current topic, or set a new one.'});
commands.push({cmd: '/whois', example: '/whois <nick>', description: 'Show information about a user.'});
commands.push({cmd: '/query', example: '/query <nick>', description: 'Open up a new chat window with nick.'});
commands.push({cmd: '/msg', example: '/msg <nick> <msg>', description: 'Send a direct message to nick.'});
commands.push({cmd: '/names', example: '/names', description: 'Show participants in the channel.'});
commands.push({cmd: '/join', example: '/join <#channel>', description: 'Join channel and open up a chat window.'});
commands.push({cmd: '/nick', example: '/nick <nick>', description: 'Change your wanted nick.'});
commands.push({cmd: '/part', example: '/part', description: 'Leave channel, and close window.'});
commands.push({cmd: '/close', example: '/close <nick>', description: 'Close conversation with nick, defaults to current active.'});
commands.push({cmd: '/kick', example: '/kick <nick>', description: 'Kick a user from the current channel.'});
commands.push({cmd: '/mode', example: '/mode [+|-][b|o|v] <user>', description: 'Change mode of yourself or a user'});
commands.push({cmd: '/reconnect', example: '/reconnect', description: 'Restart the current connection.'});
commands.push({cmd: '/clear', example: '/clear history <#channel> or /clear history <nick>', description: 'Delete all history for the given conversation.'});
commands.push({cmd: '/oper', example: '/oper <msg>', description: 'Send server operator messages.'});
commands.push({cmd: '/quote', example: '/quote <irc-command>', description: 'Allow you to send any raw IRC message.'});
